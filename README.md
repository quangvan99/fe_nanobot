# NanoBot Frontend

Frontend độc lập cho NanoBot - Personal Claude Assistant

## Phiên bản

**Frontend Version:** 2.0.1
**API Version:** 2.0.0
**Last Updated:** 2026-02-10

## Cấu trúc

```
fe_nanobot/
├── index.html      # Giao diện chính
├── styles.css      # CSS styles
├── app.js          # Logic ứng dụng
├── config.js       # Cấu hình API
├── start.sh        # Script khởi động server
└── README.md       # Tài liệu này
```

## Cách sử dụng

### 1. Cấu hình Backend URL

Mở file `config.js` và thay đổi `baseUrl` để trỏ đến backend của bạn:

```javascript
const API_CONFIG = {
    baseUrl: 'http://localhost:3000',  // Đổi thành URL backend của bạn
    endpoints: {
        message: '/api/message',
        health: '/api/health',
        history: '/api/history',
        sessions: '/api/sessions'
    }
};
```

### 2. Chạy Frontend

#### Cách 1: Sử dụng start.sh (Recommended)
```bash
cd /home/qv/projects/fe_nanobot
./start.sh
```
Sau đó mở trình duyệt: `http://localhost:8080`

#### Cách 2: Mở trực tiếp file HTML
```bash
# Mở file index.html bằng trình duyệt
xdg-open index.html
# hoặc
firefox index.html
# hoặc
google-chrome index.html
```

#### Cách 3: Sử dụng Python HTTP Server
```bash
cd /home/qv/projects/fe_nanobot
python3 -m http.server 8080
```
Sau đó mở trình duyệt: `http://localhost:8080`

#### Cách 4: Sử dụng Node.js http-server
```bash
cd /home/qv/projects/fe_nanobot
npx http-server -p 8080
```

## Tính năng

- ✅ Quản lý nhiều sessions chat
- ✅ Tự động đồng bộ sessions từ backend khi khởi động
- ✅ Tự động load session gần nhất khi vào trang
- ✅ Tự động tạo session khi gửi tin nhắn đầu tiên (không cần tạo thủ công)
- ✅ Tải lịch sử chat từ backend khi chuyển session
- ✅ Lưu trữ lịch sử chat trong localStorage (cache)
- ✅ Giao diện người dùng hiện đại, responsive
- ✅ Kiểm tra kết nối API tự động
- ✅ Tên session được sanitize (chỉ cho phép alphanumeric + hyphens)

## API Endpoints

Backend cần cung cấp các endpoints sau (API Version 2.0.0):

### POST /api/message
Gửi tin nhắn đến NanoBot assistant.

**Request:**
```json
{
    "message": "Your question here",
    "sessionId": "user-session-id"
}
```

**Response:**
```json
{
    "reply": "Assistant's response"
}
```

### GET /api/health
Health check endpoint để kiểm tra backend đang hoạt động.

**Response:**
```json
{
    "status": "ok",
    "timestamp": "2026-02-10T00:00:00.000Z"
}
```

### GET /api/history?sessionId={sessionId}
Lấy lịch sử chat của một session.

**Response:**
```json
{
    "messages": [
        {
            "id": "msg-123",
            "chat_jid": "user-session-id",
            "sender": "user",
            "content": "Hello",
            "timestamp": "2026-02-10T00:00:00.000Z"
        },
        {
            "id": "msg-124",
            "chat_jid": "user-session-id",
            "sender": "assistant",
            "content": "Hi there!",
            "timestamp": "2026-02-10T00:00:05.000Z"
        }
    ]
}
```

### GET /api/sessions
Lấy danh sách tất cả sessions đã đăng ký.

**Response:**
```json
{
    "sessions": [
        {
            "sessionId": "alice",
            "messageCount": 10,
            "lastActivity": "2026-02-10T00:00:00.000Z"
        }
    ]
}
```

## CORS Configuration

Nếu backend và frontend chạy trên domain/port khác nhau, backend cần enable CORS:

```javascript
// Example Express.js
const cors = require('cors');
app.use(cors());

// hoặc cấu hình chi tiết hơn
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});
```

## Session Management

### Cách hoạt động
1. **Auto-load từ backend**: Khi khởi động, frontend tự động tải tất cả sessions từ backend
2. **Auto-select session gần nhất**: Tự động chọn session cuối cùng (gần nhất) để tiếp tục
3. **Auto-create on first message**: Nếu chưa có session nào, tự động tạo khi gửi tin nhắn đầu tiên
4. **Backend Sessions**: Backend lưu messages trong SQLite database
5. **Sync**: Frontend cache sessions trong localStorage để tải nhanh hơn
6. **History**: Khi chuyển session, frontend tải lịch sử từ backend

### Session Naming
- Sử dụng tên có ý nghĩa: `user-alice`, `project-xyz`
- Chỉ cho phép alphanumeric và hyphens: `a-z`, `0-9`, `-`
- Frontend tự động sanitize tên session khi tạo mới
- Tránh ký tự đặc biệt và khoảng trắng

## Production Deployment

### Deploy Frontend (Static)
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload as static website
- **Cloudflare Pages**: Connect Git repository

### Cập nhật URL Backend
Nhớ đổi `baseUrl` trong `config.js` thành production URL của backend:
```javascript
baseUrl: 'https://your-nanobot-backend.com'
```

### Environment Variables (Optional)
Để dễ quản lý, có thể tạo file `config.prod.js`:
```javascript
const API_CONFIG = {
    baseUrl: process.env.BACKEND_URL || 'https://api.nanobot.com',
    // ...
};
```

## Troubleshooting

### Cannot connect to API server
- Kiểm tra backend có đang chạy không: `curl http://localhost:3000/api/health`
- Kiểm tra URL trong `config.js` có đúng không
- Kiểm tra CORS configuration của backend

### Messages not loading
- Mở DevTools (F12) → Console để xem lỗi
- Kiểm tra Network tab để xem API requests
- Đảm bảo sessionId tồn tại trong backend

### Session not found
- Backend sẽ tự động tạo session mới nếu chưa tồn tại
- Kiểm tra `data/sessions/{sessionId}/` folder trong backend

## Performance

### Expected Response Times
- Simple queries: 5-15 seconds
- Complex queries: 15-30 seconds
- First message in new session: +2-3 seconds (container startup)

### Optimization Tips
1. Reuse sessions để duy trì context
2. Không tạo quá nhiều sessions không cần thiết
3. Backend tự động cache sessions trong memory
4. Frontend cache messages trong localStorage

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Changelog

### Version 2.0.1 (2026-02-10)
- 🎯 Auto-load session gần nhất khi khởi động (không còn alert bắt tạo session)
- 🎯 Tự động tạo session khi gửi tin nhắn đầu tiên
- 🐛 Fixed undefined session bug
- 🐛 Fixed delete button not working
- ✨ Better error handling and validation
- ✨ Improved user experience - no manual session creation needed

### Version 2.0.0 (2026-02-10)
- **BREAKING:** Updated to API v2.0.0 - simplified session management
- **BREAKING:** Removed `webSessionId` - now only uses `sessionId`
- ✨ Auto-sync sessions from backend on startup
- ✨ Load chat history from backend when switching sessions
- ✨ Sanitize session names (alphanumeric + hyphens only)
- ✨ Added history and sessions API endpoints
- 🐛 Fixed session persistence issues
- 📝 Updated documentation to match API v2.0.0

### Version 1.0.0
- Initial release with dual session management (`webSessionId` + `sessionId`)

## License

MIT

---

**Need help?** Check the backend API guide at `/home/qv/projects/nanobot/api_guide.md`
