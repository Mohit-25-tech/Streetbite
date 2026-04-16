const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, getClient } = require('../config/db');
const { validationResult } = require('express-validator');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
};

const buildPasswordResetLink = (token) => {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    return `${clientUrl}/reset-password/${token}`;
};

const createPasswordResetToken = async (userId) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL', [userId]);
    await query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    );

    return { rawToken, tokenHash, expiresAt };
};

// @route POST /api/auth/register
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role = 'user' } = req.body;
    try {
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        const allowedRoles = ['user', 'vendor'];
        const userRole = allowedRoles.includes(role) ? role : 'user';
        const hash = await bcrypt.hash(password, 12);

        const result = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, avatar_url, created_at',
            [name, email, hash, userRole]
        );
        const user = result.rows[0];
        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(201).json({ success: true, user, accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
};

// @route POST /api/auth/login
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const { accessToken, refreshToken } = generateTokens(user.id);
        const { password_hash, ...safeUser } = user;
        res.json({ success: true, user: safeUser, accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not fetch user.' });
    }
};

// @route POST /api/auth/refresh
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required.' });
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const result = await query('SELECT id FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'User not found.' });
        const tokens = generateTokens(decoded.id);
        res.json({ success: true, ...tokens });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
    const { name, avatar_url } = req.body;
    try {
        const result = await query(
            'UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url) WHERE id = $3 RETURNING id, name, email, role, avatar_url',
            [name, avatar_url, req.user.id]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Profile update failed.' });
    }
};

// @route POST /api/auth/logout
const logout = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const result = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.json({
                success: true,
                message: 'If the email exists, a reset link has been prepared.',
            });
        }

        const user = result.rows[0];
        const { rawToken } = await createPasswordResetToken(user.id);
        const resetLink = buildPasswordResetLink(rawToken);

        res.json({
            success: true,
            message: 'Password reset link generated successfully.',
            resetLink,
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Could not start password reset.' });
    }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and password are required.' });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const result = await query(
            `SELECT prt.id, prt.user_id, u.email
             FROM password_reset_tokens prt
             JOIN users u ON u.id = prt.user_id
             WHERE prt.token_hash = $1
               AND prt.used_at IS NULL
               AND prt.expires_at > NOW()
             LIMIT 1`,
            [tokenHash]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
        }

        const resetRow = result.rows[0];
        const newHash = await bcrypt.hash(password, 12);
        const client = await getClient();

        try {
            await client.query('BEGIN');
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, resetRow.user_id]);
            await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRow.id]);
            await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND id <> $2 AND used_at IS NULL', [resetRow.user_id, resetRow.id]);
            await client.query('COMMIT');
        } catch (transactionErr) {
            await client.query('ROLLBACK');
            throw transactionErr;
        } finally {
            client.release();
        }

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Could not reset password.' });
    }
};

module.exports = { register, login, getMe, refreshToken, updateProfile, logout, forgotPassword, resetPassword };
