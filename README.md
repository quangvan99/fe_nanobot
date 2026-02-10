# NanoBot Frontend

Frontend độc lập cho NanoBot - Personal Claude Assistant

## Cấu trúc

```
fe_nanobot/
├── index.html      # Giao diện chính
├── styles.css      # CSS styles
├── app.js          # Logic ứng dụng
├── config.js       # Cấu hình API
└── README.md       # Tài liệu này
```

## Cách sử dụng

### 1. Cấu hình Backend URL

Mở file `config.js` và thay đổi `baseUrl` để trỏ đến backend của bạn:

```javascript
const API_CONFIG = {
    baseUrl: 'http://localhost:3000',  // Đổi thành URL backend của bạn
    // ...
};
```

### 2. Chạy Frontend

#### Cách 1: Mở trực tiếp file HTML
```bash
# Mở file index.html bằng trình duyệt
xdg-open index.html
# hoặc
firefox index.html
# hoặc
google-chrome index.html
```

#### Cách 2: Sử dụng Python HTTP Server
```bash
cd /home/qv/projects/fe_nanobot
python3 -m http.server 8080
```
Sau đó mở trình duyệt: `http://localhost:8080`

#### Cách 3: Sử dụng Node.js http-server
```bash
cd /home/qv/projects/fe_nanobot
npx http-server -p 8080
```

## Tính năng

- ✅ Quản lý nhiều sessions chat
- ✅ Lưu trữ lịch sử chat trong localStorage
- ✅ Giao diện người dùng hiện đại, responsive
- ✅ Tự động retry khi session backend bị lỗi
- ✅ Kiểm tra kết nối API tự động

## API Endpoints cần thiết

Backend cần cung cấp các endpoints sau:

### POST /api/message
```json
{
    "message": "user message",
    "sessionId": "optional-backend-session-id",
    "webSessionId": "web-session-id"
}
```

Response:
```json
{
    "reply": "assistant reply",
    "sessionId": "backend-session-id"
}
```

### GET /api/health
Health check endpoint để kiểm tra backend đang hoạt động.

## CORS Configuration

Nếu backend và frontend chạy trên domain/port khác nhau, backend cần enable CORS:

```javascript
// Example Express.js
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
```

## Production Deployment

### Deploy Frontend (Static)
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- GitHub Pages: Push to `gh-pages` branch
- AWS S3: Upload as static website

### Cập nhật URL Backend
Nhớ đổi `baseUrl` trong `config.js` thành production URL của backend.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

## License

MIT
