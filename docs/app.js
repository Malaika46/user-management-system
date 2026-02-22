// app.js - Complete with built-in config and API

// ============ CONFIGURATION ============
const CONFIG = {
    API_URL: 'http://localhost:5000/users',
    AUTH: 'Basic ' + btoa('admin:123'),
    APP_NAME: 'UserFlow',
    VERSION: '1.0.0'
};

// ============ API SERVICE ============
const UserAPI = {
    async getAllUsers() {
        try {
            const response = await fetch(CONFIG.API_URL, {
                headers: {
                    'Authorization': CONFIG.AUTH,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async addUser(userData) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': CONFIG.AUTH,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) throw new Error('Failed to add user');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async updateUser(id, userData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': CONFIG.AUTH,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) throw new Error('Failed to update user');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async deleteUser(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': CONFIG.AUTH
                }
            });
            
            if (!response.ok) throw new Error('Failed to delete user');
            return true;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// ============ UTILITY FUNCTIONS ============
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    const content = document.querySelector('.content');
    if (content) {
        content.insertBefore(alertDiv, content.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// ============ PAGE-SPECIFIC FUNCTIONS ============

// INDEX PAGE (User List)
async function loadUsers() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    try {
        const users = await UserAPI.getAllUsers();
        
        if (!users || users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="loading">
                        <i class="fas fa-inbox"></i> No users found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td><i class="fas fa-user-circle" style="color: var(--primary); margin-right: 8px;"></i>${escapeHTML(user.name || '')}</td>
                <td><i class="fas fa-envelope" style="color: var(--gray); margin-right: 8px;"></i>${escapeHTML(user.email || '')}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editUser('${user._id || user.id}', '${escapeHTML(user.name || '')}', '${escapeHTML(user.email || '')}')" class="btn-edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteUser('${user._id || user.id}')" class="btn-delete">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        showAlert('Failed to load users: ' + error.message, 'error');
    }
}

// Global functions for buttons
window.editUser = function(id, name, email) {
    localStorage.setItem('editId', id);
    localStorage.setItem('editName', name);
    localStorage.setItem('editEmail', email);
    
    // Add transition effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = 'edit.html';
    }, 300);
};

window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        await UserAPI.deleteUser(id);
        showAlert('User deleted successfully!', 'success');
        loadUsers(); // Reload the list
    } catch (error) {
        showAlert('Failed to delete user: ' + error.message, 'error');
    }
};

// ADD PAGE
function setupAddPage() {
    const form = document.getElementById('addUserForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
        
        // Validation
        if (!userData.name || !userData.email || !userData.password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(userData.email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        if (userData.password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            await UserAPI.addUser(userData);
            
            showAlert('User added successfully!', 'success');
            form.reset();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showAlert('Failed to add user: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Email validation on input
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = 'var(--danger)';
            } else {
                this.style.borderColor = '';
            }
        });
    }
}

// EDIT PAGE
function setupEditPage() {
    const form = document.getElementById('editUserForm');
    if (!form) return;
    
    // Load user data from localStorage
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const editId = localStorage.getItem('editId');
    
    if (nameInput && emailInput && editId) {
        nameInput.value = localStorage.getItem('editName') || '';
        emailInput.value = localStorage.getItem('editEmail') || '';
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = localStorage.getItem('editId');
        if (!id) {
            showAlert('No user selected for editing', 'error');
            return;
        }
        
        const userData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim()
        };
        
        if (!userData.name || !userData.email) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(userData.email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;
            
            await UserAPI.updateUser(id, userData);
            
            showAlert('User updated successfully!', 'success');
            
            setTimeout(() => {
                localStorage.removeItem('editId');
                localStorage.removeItem('editName');
                localStorage.removeItem('editEmail');
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showAlert('Failed to update user: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and initialize accordingly
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    if (path === 'index.html' || path === '') {
        loadUsers();
    } else if (path === 'add.html') {
        setupAddPage();
    } else if (path === 'edit.html') {
        setupEditPage();
    }
    
    // Add page transition effect
    document.body.style.opacity = '1';
});