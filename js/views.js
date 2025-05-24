let viewCount = 0;

async function updateViewCount() {
    try {
        const response = await fetch('http://localhost:3000/api/views', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        viewCount = data.views;
        
        // Cập nhật số lượt xem trên giao diện
        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement) {
            viewCountElement.textContent = viewCount.toLocaleString();
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật lượt xem:', error);
    }
}

// Cập nhật lượt xem khi trang được tải
document.addEventListener('DOMContentLoaded', updateViewCount);