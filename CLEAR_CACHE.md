# Clear Cache - Xóa dữ liệu localStorage

Nếu bạn gặp vấn đề với sessions cũ (như session "undefined"), hãy làm theo hướng dẫn này để xóa cache:

## Cách 1: Xóa cache trong Browser (Recommended)

### Chrome/Edge
1. Mở trang `http://192.168.6.14:8180/`
2. Nhấn `F12` để mở DevTools
3. Chọn tab **Application**
4. Trong sidebar bên trái, mở **Local Storage**
5. Click vào `http://192.168.6.14:8180`
6. Bấm chuột phải và chọn **Clear**
7. Refresh trang (F5)

### Firefox
1. Mở trang `http://192.168.6.14:8180/`
2. Nhấn `F12` để mở DevTools
3. Chọn tab **Storage**
4. Trong sidebar bên trái, mở **Local Storage**
5. Click vào `http://192.168.6.14:8180`
6. Bấm chuột phải và chọn **Delete All**
7. Refresh trang (F5)

## Cách 2: Chạy script trong Console

1. Mở trang `http://192.168.6.14:8180/`
2. Nhấn `F12` để mở DevTools
3. Chọn tab **Console**
4. Copy và paste code sau, rồi nhấn Enter:

```javascript
localStorage.clear();
location.reload();
```

## Cách 3: Xóa chỉ dữ liệu NanoBot

Nếu bạn muốn chỉ xóa dữ liệu NanoBot mà giữ lại các dữ liệu khác:

```javascript
localStorage.removeItem('nanobot_sessions');
localStorage.removeItem('nanobot_current_session');
location.reload();
```

## Sau khi xóa cache

- Trang sẽ tự động tải sessions từ backend
- Nếu backend có sessions, sẽ tự động load session gần nhất
- Nếu không có sessions, bạn chỉ cần gửi tin nhắn đầu tiên, system sẽ tự tạo session mới

## Lưu ý

- Xóa cache localStorage CHỈ xóa dữ liệu trên trình duyệt
- Dữ liệu trên backend (SQLite database) vẫn còn nguyên
- Frontend sẽ tự động sync lại từ backend sau khi xóa cache
