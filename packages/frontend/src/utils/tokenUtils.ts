export const decodeToken = (token: string): any | null => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const verifyTokenOwnership = (token: string | null, userId: string): boolean => {
    if (!token || !userId) {
        return false;
    }

    const decoded = decodeToken(token);

    if (!decoded || !decoded.sub) {
        return false;
    }

    // Strict check: Token Subject (ID) must match the requested User ID
    return decoded.sub === userId;
};
