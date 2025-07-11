
import { ChangelogEntry } from './types';

export const PLAYER_PERSONALITIES: string[] = [
    "Dũng Cảm, Bộc Trực", "Thận Trọng, Đa Nghi", "Lạnh Lùng, Ít Nói", "Hài Hước, Thích Trêu Chọc",
    "Nhân Hậu, Vị Tha", "Trầm Tính, Thích Quan Sát", "Nhút Nhát, Hay Lo Sợ", "Tò Mò, Thích Khám Phá",
    "Trung Thành, Đáng Tin Cậy", "Lãng Mạn, Mơ Mộng", "Thực Dụng, Coi Trọng Lợi Ích", "Chính Trực, Ghét Sự Giả Dối",
    "Hoài Nghi, Luôn Đặt Câu Hỏi", "Lạc Quan, Luôn Nhìn Về Phía Trước", "Lý Trí, Giỏi Phân Tích",
    "Nghệ Sĩ, Tâm Hồn Bay Bổng", "Thích Phiêu Lưu, Không Ngại Mạo Hiểm", "Cẩn Thận Từng Chi Tiết, Cầu Toàn",
    "Hào Sảng, Thích Giúp Đỡ Người Khác", "Kiên Định, Không Dễ Bỏ Cuộc", "Khiêm Tốn, Không Khoe Khoang",
    "Sáng Tạo, Nhiều Ý Tưởng Độc Đáo", "Mưu Mẹo, Gian Xảo", "Tham Lam, Ích Kỷ", "Khó Lường, Bí Ẩn", 
    "Nóng Nảy, Liều Lĩnh", "Kiêu Ngạo, Tự Phụ", "Đa Sầu Đa Cảm, Dễ Tổn Thương", "Cố Chấp, Bảo Thủ", 
    "Lười Biếng, Thích Hưởng Thụ", "Ghen Tị, Hay So Sánh", "Thù Dai, Khó Tha Thứ", "Ba Phải, Không Có Chính Kiến",
    "Tùy Chọn"
];

export const changelogData: ChangelogEntry[] = [
    {
        version: "2.8.1 (Sửa Lỗi Lặp Lại Bối Cảnh)",
        date: "07/07/2025",
        changes: [
            { type: "FIX", text: "Khắc phục lỗi AI lặp lại bối cảnh và các chi tiết khởi đầu trong mỗi lượt chơi." },
            { type: "IMPROVE", text: "Tối ưu hóa cách gửi prompt cho AI, đảm bảo thông tin khởi đầu chỉ được gửi một lần duy nhất." },
            { type: "IMPROVE", text: "Làm rõ hướng dẫn về 'Ký ức tạm thời' để AI chỉ sử dụng nội bộ, không lặp lại trong câu chuyện." },
        ],
    },
    {
        version: "2.8.0 (Tối Ưu Ký Ức & Tính Cách Tùy Chỉnh)",
        date: "07/07/2025",
        changes: [
            { type: "IMPROVE", text: "Ký ức tạm thời giờ đây chỉ dùng để AI duy trì bối cảnh và tính nhất quán nội bộ, không lặp lại trong cốt truyện chính hoặc lựa chọn." },
            { type: "NEW", text: "Thêm tùy chọn 'Tùy Chọn' cho mục 'Tính Cách', cho phép người chơi tự nhập tính cách mong muốn." },
        ],
    },
    {
        version: "2.7.5 (Sửa Lỗi Tri Thức - Hoàn Chỉnh)",
        date: "07/07/2025",
        changes: [
            { type: "FIX", text: "Sửa dứt điểm lỗi nút 'Thêm Luật Mới' trong Tri Thức Thế Giới không hoạt động bằng cách định nghĩa và truyền props chính xác." },
        ],
    },
    {
        version: "2.7.4 (Tối ưu hóa Hiệu Suất)",
        date: "07/07/2025",
        changes: [
            { type: "FIX", text: "Sửa lỗi nghiêm trọng khiến việc tải game và hiển thị lịch sử truyện rất chậm bằng cách áp dụng kỹ thuật ghi nhớ (memoization)." },
        ],
    },
];