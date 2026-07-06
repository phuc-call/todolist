# Quản lý công việc (Todo List) - Backend API

Đây là dự án backend cho ứng dụng Quản lý công việc (Todo List), được phát triển bằng Java 21 và Spring Boot. 

Dự án đáp ứng đầy đủ các yêu cầu cơ bản và nâng cao cho vị trí Intern Developer:
- Hoàn thiện toàn bộ các tính năng CRUD công việc.
- Hỗ trợ phân trang, sắp xếp, lọc dữ liệu (Điểm cộng).
- Sử dụng chuẩn RESTful API, chia layer rõ ràng, Clean Code.
- Validation chặt chẽ, bắt lỗi Global (Controller Advice).
- Có Unit Test cho Controller và Service (Điểm cộng).
- Tích hợp sẵn Docker để chạy dự án chỉ với 1 lệnh (Điểm cộng).

**Link GitHub dự án:** https://github.com/phuc-call/todolist

---

## Hướng dẫn cài đặt và chạy dự án (Sử dụng Docker)

Đây là cách nhanh nhất và **khuyên dùng** để chạy dự án mà không cần phải cài đặt Java, Maven hay cấu hình Database trên máy của bạn. *(Lưu ý: Nếu chạy bằng Docker, bạn không cần phải kiểm tra môi trường Java ở trên máy).*

### Bước 1: Kiểm tra máy đã có Docker chưa
Mở Command Prompt (nhấn phím `Windows`, gõ "cmd", Enter), gõ:
```bash
docker --version
```
- Nếu ra số phiên bản → Máy đã có Docker, bỏ qua Bước 2, **làm thẳng Bước 3**.
- Nếu báo lỗi "not recognized" → Máy chưa có Docker, **làm tiếp Bước 2**.

### Bước 2: Cài Docker Desktop
1. Vào trang chủ: https://www.docker.com/products/docker-desktop
2. Bấm **Download for Windows**.
3. Mở file vừa tải, cài như phần mềm bình thường (`Next` → `Next` → `Install`).
4. Máy tính sẽ yêu cầu khởi động lại — đồng ý restart.
5. Sau khi máy tính khởi động lại, mở phần mềm **Docker Desktop** lên (icon con cá voi 🐳), đợi tới khi góc dưới bên trái hiện chữ "Engine running" màu xanh.

> **Lưu ý quan trọng:** Nhấn chuột phải vào icon Docker ở khay hệ thống (góc dưới bên phải màn hình, cạnh đồng hồ), đảm bảo đang chọn **"Switch to Linux containers"** (không phải Windows containers) — nếu không chọn đúng sẽ báo lỗi khi chạy.
*(Yêu cầu tối thiểu: Docker Desktop 20.10 trở lên — cứ tải bản mới nhất trên trang chủ là dư sức đáp ứng).*

### Bước 3: Cài Git (nếu chưa có) và tải project về
Kiểm tra xem máy đã có Git chưa bằng lệnh:
```bash
git --version
```
- Nếu chưa có, tải tại: https://git-scm.com/downloads và cài đặt.
- Sau đó, tải project về máy tính bằng lệnh:
```bash
git clone https://github.com/phuc-call/todolist
```

### Bước 4: Thêm file cấu hình `.env`
Vì file `.env` chứa mật khẩu bảo mật nên không được đưa lên Git công khai. Bạn cần tự tạo file này trên máy.
1. Đi tới thư mục gốc của project vừa tải về (thư mục chứa file `docker-compose.yml`).
2. Tạo một file mới và đặt tên chính xác là `.env` (ngang hàng với file `docker-compose.yml`).
3. Mở file `.env` bằng Notepad hoặc bất kỳ trình soạn thảo nào và dán nội dung sau vào:
```env
DB_NAME=todolist_db
DB_USER=todolist_user
DB_PASSWORD=todolist_password
DB_ROOT_PASSWORD=root_password
```

### Bước 5: Chạy dự án
Trong Command Prompt (cmd), di chuyển vào thư mục project:
```bash
cd đường-dẫn-tới-thư-mục-project/todolist
```
Tiếp theo, chạy lệnh sau:
```bash
docker-compose up -d
```
*(Nếu dùng bản Docker mới có thể dùng lệnh `docker compose up -d` không có dấu gạch ngang).*

Đợi 1-2 phút để Docker tải image và khởi động Database + Backend. Sau khi chạy xong, ứng dụng sẽ có sẵn ở địa chỉ:
**`http://localhost:8080`**

### Các lần sử dụng tiếp theo (Lần 2, 3, 4...)

> **Lưu ý bắt buộc:** Mỗi lần bật máy lên làm việc, bạn phải mở **Docker Desktop** trước và đợi cho đến khi hiện chữ "Engine running" thì mới chạy các lệnh bên dưới.
> *(Mẹo: Vào Settings → General → bật "Start Docker Desktop when you log in" để Docker tự khởi động cùng máy.)*

Sau lần đầu chạy `docker-compose up -d`, các container đã được tạo sẵn. Những lần sau chỉ cần:

| Mục đích | Lệnh |
|---|---|
| **Khởi động lại** container (lần 2 trở đi) | `docker-compose start` |
| **Dừng** container (giữ nguyên dữ liệu) | `docker-compose stop` |
| **Xóa** toàn bộ container (reset sạch) | `docker-compose down` |
| **Xóa** container + toàn bộ dữ liệu DB | `docker-compose down -v` ⚠️ |

> ⚠️ Lệnh `docker-compose down -v` sẽ **xóa hoàn toàn dữ liệu database**, chỉ dùng khi muốn reset từ đầu.

---

## Chạy dự án trực tiếp ở Local (Không dùng Docker)
Nếu không chạy bằng Docker, vui lòng thực hiện các bước sau:

**1. Kiểm tra phiên bản Java:**
Dự án yêu cầu Java 21. Mở cmd gõ:
```bash
java -version
```
Nếu chưa có hoặc phiên bản thấp hơn, vui lòng tải và cài đặt JDK 21.

**2. Cấu hình Database:**
Tạo 1 cơ sở dữ liệu MySQL ở máy cá nhân. Cập nhật URL, Username và Password trực tiếp vào file `src/main/resources/application.properties`.

**3. Chạy lệnh Build và Run:**
Di chuyển vào thư mục dự án và gõ lệnh:
```bash
./mvnw spring-boot:run
```
Ứng dụng sẽ khởi chạy tại `http://localhost:8080`.

---

## Chạy Giao diện (Frontend)
Dự án sử dụng Vanilla JavaScript kết hợp với công cụ Vite để tối ưu tốc độ khởi chạy.

**1. Yêu cầu hệ thống (Điều kiện tiên quyết):**
- Máy tính phải cài đặt **Node.js** (Yêu cầu phiên bản **v18 trở lên**, dự án đã được test ổn định nhất trên bản **v20.19.5**).
- Để kiểm tra máy đã có Node.js chưa, mở Command Prompt (cmd) và gõ lệnh:
```bash
node -v
```
> Nếu máy báo lỗi `not recognized`, bạn cần tải Node.js tại [https://nodejs.org/](https://nodejs.org/) và cài đặt (Next liên tục là được).

**2. Cài đặt thư viện và Khởi chạy:**
Mở một Command Prompt (cmd) mới, di chuyển vào thư mục `frontend`:
```bash
cd đường-dẫn-tới-thư-mục-project/frontend
```

Tiếp theo, chạy lệnh sau để tải các gói cài đặt (chỉ cần chạy lần đầu tiên):
```bash
npm install
```

Cuối cùng, khởi động server Frontend bằng lệnh:
```bash
npm run dev
```

Trình duyệt sẽ tự động mở ra, hoặc bạn có thể tự truy cập vào địa chỉ:
**`http://localhost:5173`**