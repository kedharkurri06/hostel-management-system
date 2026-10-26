const { isValidObjectId, validateRequired, validateEnum, sanitize } = require('../src/validators');

describe('Server Validators', () => {
  test('isValidObjectId correctly validates MongoDB ObjectIds', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    expect(isValidObjectId('invalid-id')).toBe(false);
    expect(isValidObjectId('')).toBe(false);
  });

  test('validateRequired identifies missing or empty fields', () => {
    const body = { name: 'Rahul', email: '   ', roomNo: '304' };
    const missing = validateRequired(['name', 'email', 'phone', 'roomNo'], body);
    expect(missing).toContain('email');
    expect(missing).toContain('phone');
    expect(missing).not.toContain('name');
    expect(missing).not.toContain('roomNo');
  });

  test('validateEnum validates allowed enum values', () => {
    const allowed = ['Low', 'Medium', 'High', 'Emergency'];
    expect(validateEnum('Emergency', allowed, 'Priority')).toBeNull();
    expect(validateEnum('Critical', allowed, 'Priority')).toContain('Priority must be one of');
  });

  test('sanitize escapes HTML tags', () => {
    const raw = '<script>alert("xss")</script>';
    const cleaned = sanitize(raw);
    expect(cleaned).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
