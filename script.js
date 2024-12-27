// Lấy các phần tử cần thiết
const video = document.getElementById("background-video");
const volumeSlider = document.querySelector("#volume-control .level");
const overlay = document.getElementById("overlay");

// Đặt âm lượng ban đầu
video.volume = 0.5;

// Tự động phát video và ẩn lớp mờ khi người dùng click vào trang
document.body.addEventListener(
    "click",
    () => {
        if (video.paused) {
            video.muted = false; // Bỏ tắt tiếng (nếu có)
            video.play(); // Phát video
        }

        // Ẩn lớp mờ
        overlay.classList.add("hidden");
    },
    { once: true } // Đảm bảo chỉ thực hiện một lần
);

// Thay đổi âm lượng video khi kéo slider
volumeSlider.addEventListener("input", (event) => {
    const volume = event.target.value / 100; // Giá trị từ 0 đến 1
    video.volume = volume;
});
// Lấy các phần tử cần thiết
const heartCheckbox = document.querySelector('.checkbox');
const likeCountElement = document.querySelector('.like-count');

// Khởi tạo biến để lưu số lượt thích
let likeCount = 0;

// Lắng nghe sự kiện khi nhấn vào nút trái tim
heartCheckbox.addEventListener('change', () => {
    if (heartCheckbox.checked) {
        likeCount++; // Tăng số lượt thích
    } else {
        likeCount--; // Giảm số lượt thích
    }

    // Cập nhật nội dung hiển thị
    likeCountElement.textContent = likeCount;
});
