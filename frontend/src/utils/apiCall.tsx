const API_URL = 'http://localhost:4000/api';

const apiCall = async (endpoint: string, method = 'GET', body: any = null, isFile = false) => {
    const headers: HeadersInit = {};
    const token = localStorage.getItem('token');
    
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFile) headers['Content-Type'] = 'application/json';

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = isFile ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
    }
    return response.json();
};

export default apiCall;