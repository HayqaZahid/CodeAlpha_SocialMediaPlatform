const API_BASE = 'http://localhost:3000/api';
console.log('API_BASE:', API_BASE);

async function testAPI() {
    try {
        console.log(' Testing API connectivity...');
        const testResponse = await fetch(`${API_BASE}/test`);
        const testData = await testResponse.json();
        console.log(' Basic API test:', testData);
        const token = localStorage.getItem('token');
        if (token) {
            const postsResponse = await fetch(`${API_BASE}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(' Posts API status:', postsResponse.status);
        }      
    } catch (error) {
        console.error('API test failed:', error);
    }
}
testAPI();
let currentUser = null;
let posts = [];
let notifications = [];
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const notificationsBtn = document.getElementById('notifications-btn');
const postSubmitBtn = document.querySelector('.post-submit');
const postsContainer = document.querySelector('.posts-container');
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadPosts();
    loadNotifications();
    setupEventListeners();
});
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchAuthTab);
    });

    document.querySelector('.close').addEventListener('click', closeAuthModal);

 document.getElementById('mark-all-read-btn').addEventListener('click', markAllNotificationsAsRead);
document.getElementById('notifications-btn').addEventListener('click', function() {
        loadNotifications();
    });
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    notificationsBtn.addEventListener('click', toggleNotifications);
    postSubmitBtn.addEventListener('click', createPost);
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            closeAuthModal();
        }
    });
}
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showAuthenticatedUI();
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    authModal.style.display = 'block';
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function switchAuthTab(e) {
    const tab = e.target.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    e.target.classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };
console.log('Login attempt:', credentials);
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
console.log('Login response:', data);
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            closeAuthModal();
            showAuthenticatedUI();
            loadPosts();
            loadNotifications();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        bio: formData.get('bio') || ''
    };
console.log('Register attempt:', userData);
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
 console.log('Register response:', data);
        if (response.ok) {
            alert('Registration successful! Please login.');
            switchToLoginTab();
             e.target.reset();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    console.log('Login attempt:', credentials);

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        console.log('Login response status:', response.status);
        console.log('Login response data:', data);

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            closeAuthModal();
            showAuthenticatedUI();
            loadPosts();
            loadNotifications();
            alert('Login successful!');
        } else {
            alert(data.message || 'Login failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check if the backend is running.');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showAuthModal();
    postsContainer.innerHTML = '';
}

function showAuthenticatedUI() {
    document.querySelector('.username').textContent = currentUser.username;
    document.querySelector('.user-bio').textContent = currentUser.bio;
    document.querySelectorAll('.user-avatar, .profile-avatar, .avatar-sm').forEach(img => {
        img.src = currentUser.profilePicture || 'images/default-avatar.jpg';
    });
}
async function loadPosts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            posts = await response.json();
            renderPosts();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}
function renderPosts() {
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <img src="${post.user.profilePicture || 'images/default-avatar.jpg'}" 
                     alt="${post.user.username}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.user.username}</h4>
                    <span>${formatDate(post.createdAt)}</span>
                </div>
            </div>
            ${post.user._id === currentUser._id ? `
                <div class="post-actions">
                    <button class="post-action-btn delete-post-btn" data-post-id="${post._id}" title="Delete Post">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        </div>
        <div class="post-content">
            <p class="post-text">${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        <div class="post-stats">
            <span>${post.likes.length} likes</span>
            <span>${post.comments.length} comments</span>
        </div>
        <div class="post-actions-bar">
            <button class="post-action like-btn ${post.likes.includes(currentUser._id) ? 'liked' : ''}" 
                    data-post-id="${post._id}">
                <i class="fas fa-heart"></i> Like
            </button>
            <button class="post-action comment-btn" data-post-id="${post._id}">
                <i class="fas fa-comment"></i> Comment
            </button>
            <button class="post-action share-btn">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
        <div class="comments-section">
            ${renderComments(post.comments)}
            <div class="add-comment">
                <img src="${currentUser.profilePicture || 'images/default-avatar.jpg'}" 
                     alt="Your avatar" class="avatar-sm">
                <input type="text" placeholder="Write a comment..." 
                       data-post-id="${post._id}" class="comment-input">
            </div>
        </div>
    `;
    postDiv.querySelector('.like-btn').addEventListener('click', handleLike);
    postDiv.querySelector('.comment-input').addEventListener('keypress', handleCommentSubmit);
    const deleteBtn = postDiv.querySelector('.delete-post-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeletePost);
    }

    return postDiv;
}
function renderComments(comments) {
    return comments.map(comment => `
        <div class="comment">
            <img src="${comment.user.profilePicture || 'images/default-avatar.jpg'}" 
                 alt="${comment.user.username}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${comment.user.username}</span>
                    <div class="comment-actions">
                        ${comment.user._id === currentUser._id ? `
                            <button class="comment-action edit-comment" data-comment-id="${comment._id}">Edit</button>
                            <button class="comment-action delete-comment" data-comment-id="${comment._id}">Delete</button>
                        ` : ''}
                    </div>
                </div>
                <p class="comment-text">${comment.content}</p>
            </div>
        </div>
    `).join('');
}
async function createPost() {
    const postInput = document.querySelector('.post-input input');
    const content = postInput.value.trim();

    console.log('Creating post with content:', content);

    if (!content) {
        alert('Please write something before posting!');
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first!');
        showAuthModal();
        return;
    }

    console.log(' Token exists:', !!token);
    console.log(' Current user:', currentUser);

    try {
        console.log('Sending POST request to:', `${API_BASE}/posts`);
        
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        console.log(' Response status:', response.status);

        if (response.ok) {
            const newPost = await response.json();
            console.log(' Post created successfully:', newPost);
            
            postInput.value = ''; 
            await loadPosts(); 
            console.log(' Posts reloaded');
        } else {
            const errorData = await response.json();
            console.error(' Error response:', errorData);
            alert('Error creating post: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error(' Error creating post:', error);
        alert('Network error: ' + error.message);
    }
}
async function handleLike(e) {
    const postId = e.target.closest('.like-btn').dataset.postId;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadPosts();
            loadNotifications(); 
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

async function handleCommentSubmit(e) {
    if (e.key === 'Enter') {
        const input = e.target;
        const content = input.value.trim();
        const postId = input.dataset.postId;

        if (!content) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                input.value = '';
                loadPosts(); 
                loadNotifications();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
}
async function loadNotifications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            notifications = await response.json();
            renderNotifications();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function renderNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="no-notifications">No notifications yet</div>';
        return;
    }

    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-notification-id="${notification._id}">
            <img src="${notification.fromUser.profilePicture || 'images/default-avatar.jpg'}" 
                 alt="${notification.fromUser.username}" class="notification-avatar">
            <div class="notification-content">
                <div class="notification-text">
                    <strong>${notification.fromUser.username}</strong> ${getNotificationText(notification.type)}
                    ${notification.post ? ' on your post' : ''}
                </div>
                <div class="notification-time">${formatDate(notification.createdAt)}</div>
                <div class="notification-actions">
                    <button class="notification-action mark-read-btn">Mark read</button>
                    ${notification.post ? `<button class="notification-action view-post-btn">View post</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const notificationItem = e.target.closest('.notification-item');
            const notificationId = notificationItem.dataset.notificationId;
            await markNotificationAsRead(notificationId);
        });
    });

    document.querySelectorAll('.view-post-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const notificationItem = e.target.closest('.notification-item');
            const notificationId = notificationItem.dataset.notificationId;
            const notification = notifications.find(n => n._id === notificationId);
            if (notification && notification.post) {
               
                alert('This would scroll to the post. Post ID: ' + notification.post);
            }
        });
    });
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async () => {
            const notificationId = item.dataset.notificationId;
            await markNotificationAsRead(notificationId);
        });
    });
}

function getNotificationText(type) {
    switch (type) {
        case 'like': return 'liked your post';
        case 'comment': return 'commented on your post';
        case 'follow': return 'started following you';
        default: return 'interacted with your content';
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const notification = notifications.find(n => n._id === notificationId);
            if (notification) {
                notification.read = true;
            }
            renderNotifications();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllNotificationsAsRead() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            notifications.forEach(n => n.read = true);
            renderNotifications();
            updateNotificationBadge();
            alert('All notifications marked as read!');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-count');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}
setInterval(loadNotifications, 30000); 
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}
function loadSampleData() {
    if (posts.length === 0) {
        posts = [
            {
                _id: '1',
                user: { username: 'jane_doe', profilePicture: 'images/user1.jpg' },
                content: 'Just launched my new website!  So excited to share this journey with you all!',
                image: 'images/post1.jpg',
                likes: ['user1', 'user2'],
                comments: [
                    {
                        _id: 'c1',
                        user: { username: 'john_smith', profilePicture: 'images/user2.jpg' },
                        content: 'This looks amazing! Great work!',
                        createdAt: new Date(Date.now() - 3600000)
                    }
                ],
                createdAt: new Date(Date.now() - 7200000)
            },
            {
                _id: '2',
                user: { username: 'tech_guru', profilePicture: 'images/user3.jpg' },
                content: 'Beautiful sunset from my balcony today. Sometimes you just need to appreciate the simple things in life. ',
                image: 'images/post2.jpg',
                likes: ['user1'],
                comments: [],
                createdAt: new Date(Date.now() - 10800000)
            }
        ];
        renderPosts();
    }
}
setTimeout(loadSampleData, 1000);
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('profile-btn').addEventListener('click', showProfileModal);
    document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
    document.getElementById('settings-form').addEventListener('submit', handleSettingsUpdate);
    document.querySelectorAll('.close[data-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'none';
        });
    });
});
function showProfileModal(e) {
    e.preventDefault();
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'block';
    loadUserProfile();
}
function showSettingsModal(e) {
    e.preventDefault();
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'block';
    document.getElementById('settings-username').value = currentUser.username;
    document.getElementById('settings-email').value = currentUser.email;
    document.getElementById('settings-bio').value = currentUser.bio || '';
    document.getElementById('settings-avatar').value = currentUser.profilePicture || '';
}
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users/${currentUser.username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('profile-modal-username').textContent = userData.username;
            document.getElementById('profile-modal-bio').textContent = userData.bio || 'No bio yet';
            document.getElementById('profile-modal-avatar').src = userData.profilePicture || 'images/default-avatar.jpg';
            document.getElementById('profile-followers-count').textContent = userData.followers.length;
            document.getElementById('profile-following-count').textContent = userData.following.length;
            loadUserPosts(userData._id);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}
async function loadUserPosts(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const allPosts = await response.json();
            const userPosts = allPosts.filter(post => post.user._id === userId);
            
            document.getElementById('profile-posts-count').textContent = userPosts.length;
            const postsGrid = document.getElementById('user-posts-grid');
            postsGrid.innerHTML = userPosts.map(post => `
                <div class="post-thumbnail">
                    ${post.image ? 
                        `<img src="${post.image}" alt="Post" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : 
                        '📝'
                    }
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading user posts:', error);
    }
}
async function handleSettingsUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updateData = {
        username: formData.get('username'),
        email: formData.get('email'),
        bio: formData.get('bio'),
        profilePicture: formData.get('profilePicture')
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            const data = await response.json();
            alert('Profile updated successfully!');
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            showAuthenticatedUI();
            document.getElementById('settings-modal').style.display = 'none';
        } else {
            const error = await response.json();
            alert(error.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Error updating profile');
    }
}
function showAuthenticatedUI() {
    if (!currentUser) return;
    
    document.querySelector('.username').textContent = currentUser.username;
    document.querySelector('.user-bio').textContent = currentUser.bio || 'No bio yet';
    document.querySelectorAll('.user-avatar, .profile-avatar, .avatar-sm, .profile-large-avatar').forEach(img => {
        img.src = currentUser.profilePicture || 'images/default-avatar.jpg';
    });
    
    document.querySelectorAll('.stat .count').forEach((count, index) => {
        if (index === 0) count.textContent = '0';
        if (index === 1) count.textContent = currentUser.followers?.length || '0';
        if (index === 2) count.textContent = currentUser.following?.length || '0';
    });
}

document.addEventListener('click', async (e) => {
  
    if (e.target.classList.contains('delete-comment')) {
        const commentId = e.target.dataset.commentId;
        await deleteComment(commentId);
    }
    
    if (e.target.classList.contains('edit-comment')) {
        const commentId = e.target.dataset.commentId;
        const commentElement = e.target.closest('.comment');
        await editComment(commentId, commentElement);
    }
});

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Delete comment response:', data);

        if (response.ok) {
           
            loadPosts();
        } else {
            alert(data.message || 'Error deleting comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment');
    }
}

async function editComment(commentId, commentElement) {
    const commentText = commentElement.querySelector('.comment-text');
    const currentContent = commentText.textContent;
    
    commentText.innerHTML = `
        <input type="text" class="edit-comment-input" value="${currentContent}" style="width:100%;padding:5px;">
        <div style="margin-top:5px;">
            <button class="save-comment-btn" data-comment-id="${commentId}">Save</button>
            <button class="cancel-edit-btn">Cancel</button>
        </div>
    `;
    commentElement.querySelector('.save-comment-btn').addEventListener('click', async (e) => {
        const newContent = commentElement.querySelector('.edit-comment-input').value;
        await updateComment(commentId, newContent);
    });
    
    commentElement.querySelector('.cancel-edit-btn').addEventListener('click', () => {
        loadPosts(); 
    });
}

async function updateComment(commentId, newContent) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newContent })
        });

        const data = await response.json();

        if (response.ok) {
            loadPosts(); 
        } else {
            alert(data.message || 'Error updating comment');
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        alert('Error updating comment');
    }
}
async function checkAndRefreshToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
       
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return true; 
        } else {
          
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            currentUser = null;
            showAuthModal();
            return false;
        }
    } catch (error) {
        console.error('Token check failed:', error);
        return false;
    }
}

async function handleSettingsUpdate(e) {
    e.preventDefault();
    
    const tokenValid = await checkAndRefreshToken();
    if (!tokenValid) {
        alert('Your session has expired. Please login again.');
        showAuthModal();
        return;
    }
    
    const formData = new FormData(e.target);
    const updateData = {
        username: formData.get('username'),
        email: formData.get('email'),
        bio: formData.get('bio'),
        profilePicture: formData.get('profilePicture')
    };
    
    console.log('Updating profile with:', updateData);
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (response.ok) {
            alert('Profile updated successfully!');
            
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAuthenticatedUI();
            
            document.getElementById('settings-modal').style.display = 'none';
        } else {
            alert(data.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Error updating profile. Please try again.');
    }
}

async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showAuthModal();
        throw new Error('No token found');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            currentUser = null;
            showAuthModal();
            throw new Error('Session expired. Please login again.');
        }
        
        return response;
    } catch (error) {
        if (error.message.includes('Session expired')) {
            alert('Your session has expired. Please login again.');
        }
        throw error;
    }
}

async function loadPosts() {
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE}/posts`);
        
        if (response.ok) {
            posts = await response.json();
            renderPosts();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

async function handleSettingsUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updateData = {
        username: formData.get('username'),
        email: formData.get('email'),
        bio: formData.get('bio'),
        profilePicture: formData.get('profilePicture')
    };
    
    console.log('Updating profile with:', updateData);
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE}/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (response.ok) {
            alert('Profile updated successfully!');
        
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAuthenticatedUI();
            
            document.getElementById('settings-modal').style.display = 'none';
        } else {
            alert(data.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
    }
}
async function handleDeletePost(e) {
    
    const deleteButton = e.target.closest('.delete-post-btn');
    if (!deleteButton) {
        console.error(' Delete button not found');
        return;
    }
    
    const postId = deleteButton.dataset.postId;
    
    console.log(' Attempting to delete post:', postId);
    console.log(' Current user:', currentUser);
    
    if (!postId) {
        alert('Error: Post ID is missing');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login again');
            showAuthModal();
            return;
        }
        
        console.log(' Token exists:', !!token);
        
        const url = `${API_BASE}/posts/${postId}`;
        console.log(' Making DELETE request to:', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Delete response status:', response.status);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(' Delete response data:', data);

            if (response.ok) {
                console.log(' Post deleted successfully');
               
                const postElement = e.target.closest('.post');
                if (postElement) {
                    postElement.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => {
                        postElement.remove();
                        
                        loadPosts();
                        if (currentUser) loadUserProfile();
                    }, 300);
                }
            } else {
                alert(data.message || `Error deleting post: ${response.status}`);
            }
        } else {
           
            const text = await response.text();
            console.error(' Non-JSON response:', text);
            alert(`Server error: ${response.status}. Please check console for details.`);
        }
    } catch (error) {
        console.error(' Error deleting post:', error);
        alert('Network error deleting post: ' + error.message);
    }
}
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users/${currentUser.username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            document.getElementById('profile-modal-username').textContent = userData.username;
            document.getElementById('profile-modal-bio').textContent = userData.bio || 'No bio yet';
            document.getElementById('profile-modal-avatar').src = userData.profilePicture || 'images/default-avatar.jpg';
            document.getElementById('profile-followers-count').textContent = userData.followers.length;
            document.getElementById('profile-following-count').textContent = userData.following.length;
            
            loadUserPosts(userData._id);
        
            updateSidebarStats(userData);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateSidebarStats(userData) {
    const stats = document.querySelectorAll('.user-stats .count');
    if (stats.length >= 3) {
        
        stats[1].textContent = userData.followers.length;
        stats[2].textContent = userData.following.length;
    }
}

async function loadUserPosts(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const allPosts = await response.json();
            const userPosts = allPosts.filter(post => post.user._id === userId);
            
            document.getElementById('profile-posts-count').textContent = userPosts.length;
            
            const sidebarStats = document.querySelectorAll('.user-stats .count');
            if (sidebarStats.length >= 3) {
                sidebarStats[0].textContent = userPosts.length;
            }
            
            const postsGrid = document.getElementById('user-posts-grid');
            postsGrid.innerHTML = userPosts.map(post => `
                <div class="post-thumbnail">
                    ${post.image ? 
                        `<img src="${post.image}" alt="Post" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : 
                        `<div style="padding:10px;text-align:center;">${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}</div>`
                    }
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading user posts:', error);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const postBtn = document.querySelector('.post-submit');
    if (postBtn) {
      
        postBtn.replaceWith(postBtn.cloneNode(true));
        const newPostBtn = document.querySelector('.post-submit');
        newPostBtn.addEventListener('click', createPost);
        console.log(' Post button fixed and listener attached');
    }
});

function createSamplePosts() {
    const samplePosts = [
        {
            _id: 'sample1',
            user: { 
                username: 'tech_lover', 
                profilePicture: 'images/user1.jpg' 
            },
            content: 'Just deployed my new MERN stack project! So excited to share it with everyone. 🚀',
            image: 'images/post1.jpg',
            likes: ['user2', 'user3'],
            comments: [
                {
                    _id: 'comment1',
                    user: { 
                        username: 'code_master', 
                        profilePicture: 'images/user2.jpg' 
                    },
                    content: 'This looks amazing! Great work!',
                    createdAt: new Date(Date.now() - 3600000)
                },
                {
                    _id: 'comment2',
                    user: { 
                        username: 'web_dev', 
                        profilePicture: 'images/user3.jpg' 
                    },
                    content: 'Love the design! Which framework did you use?',
                    createdAt: new Date(Date.now() - 1800000)
                }
            ],
            createdAt: new Date(Date.now() - 7200000)
        },
        {
            _id: 'sample2',
            user: { 
                username: 'nature_photographer', 
                profilePicture: 'images/user4.jpg' 
            },
            content: 'Beautiful sunset from my balcony today. Sometimes you just need to appreciate the simple things in life. 🌅',
            image: 'images/post2.jpg',
            likes: ['user1', 'user2'],
            comments: [
                {
                    _id: 'comment3',
                    user: { 
                        username: 'travel_buddy', 
                        profilePicture: 'images/user5.jpg' 
                    },
                    content: 'Wow! Where was this taken?',
                    createdAt: new Date(Date.now() - 900000)
                }
            ],
            createdAt: new Date(Date.now() - 10800000)
        }
    ];
    posts = [...samplePosts, ...posts];
    renderPosts();
}

function clearSampleData() {
    posts = posts.filter(post => !post._id.includes('sample'));
    renderPosts();
}

function toggleAdminControls() {
    const adminControls = document.querySelector('.admin-controls');
    adminControls.style.display = adminControls.style.display === 'none' ? 'block' : 'none';
}

function createWelcomePost() {
    const welcomePost = {
        _id: 'welcome_post',
        user: { 
            username: 'SocialConnect', 
            profilePicture: 'images/default-avatar.jpg' 
        },
        content: 'Welcome to SocialConnect! 🎉 This is a demo social media platform built with the MERN stack. Feel free to explore all the features!',
        image: null,
        likes: [],
        comments: [
            {
                _id: 'welcome_comment1',
                user: { 
                    username: 'Admin', 
                    profilePicture: 'images/default-avatar.jpg' 
                },
                content: 'You can create posts, like, comment, and follow other users!',
                createdAt: new Date()
            },
            {
                _id: 'welcome_comment2',
                user: { 
                    username: 'Support', 
                    profilePicture: 'images/default-avatar.jpg' 
                },
                content: 'Try clicking on the profile picture to access settings and edit your profile!',
                createdAt: new Date()
            }
        ],
        createdAt: new Date()
    };

    posts.unshift(welcomePost);
    renderPosts();
}

function addSamplePost(content, image = null) {
    const sampleUsers = [
        { username: 'tech_enthusiast', profilePicture: 'images/user1.jpg' },
        { username: 'coding_ninja', profilePicture: 'images/user2.jpg' },
        { username: 'web_designer', profilePicture: 'images/user3.jpg' },
        { username: 'javascript_lover', profilePicture: 'images/user4.jpg' }
    ];

    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    
    const newPost = {
        _id: 'sample_' + Date.now(),
        user: randomUser,
        content: content,
        image: image,
        likes: [],
        comments: [],
        createdAt: new Date()
    };

    posts.unshift(newPost);
    renderPosts();
}


