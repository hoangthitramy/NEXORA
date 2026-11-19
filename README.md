# EXITCONTROL - He thong Kiem soat Quy trinh Thoi viec va Ban giao Nhan su

## 1. Tong quan du an

EXITCONTROL la he thong ung dung web quan tri doanh nghiep chuyen sau, duoc thiet ke nham tieu chuan hoa, tu dong hoa va giam sat tap trung toan bo quy trinh nghi viec (Employee Offboarding) va ban giao cong viec giua nhan su voi cac phong ban lien quan.

He thong giai quyet cac van de thuc te trong quan tri doanh nghiep:
- Tranh tinh trang bo sot cong viec, tai lieu va quy trinh ban giao giua nhan su nghi viec va nguoi tiep nhan.
- Kiem soat chat che viec thu hoi tai san vat ly (may tinh, thiet bi, the tu, phu kien) va quyen truy cap he thong so (Email, VPN, Cloud, Code Repository).
- Ngan ngua rui ro that thoat tai chinh thong qua phan he doi soat tam ung va cong no truoc khi quyet toan ky luong cuoi.
- Ghi nhan bien ban va phuong an giai quyet doi voi cac su co ngoai le (mat mat tai san, ket tai khoan, cham ban giao).
- Cung cap nhat ky kiem toan toan dien (Audit Trail) phuc vu cong tac doi soat, tuan thu bao mat va kiem toan noi bo.

---

## 2. Kien truc he thong va Cong nghe su dung

He thong duoc xay dung theo mo hinh Client-Server da tang (Multi-tier Architecture):

### 2.1. Frontend Application
- Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- Routing: React Router v6
- State Management: Zustand
- HTTP Client: Axios (Interceptor quan ly JWT)
- Icons: Lucide React (Giao dien toi gian theo chuan doanh nghiep)

### 2.2. Backend API Services
- Runtime: Node.js (ES Modules)
- Web Framework: Express.js
- API Standard: RESTful API, chuan hoa JSON response
- Authentication & Security: JSON Web Token (JWT), bcrypt hashing, Helmet, CORS, Express Rate Limit
- API Documentation: Swagger UI (OpenAPI Specification 3.0)
- File Storage: Multer (Luu tru bien ban, chung tu ban giao)

### 2.3. Database & ORM
- Database Engine: MySQL 8.0+
- ORM: Prisma ORM (27 bang thuc the quan he, rang buoc toan ven Referential Integrity)
- Migration & Synchronization: Prisma Client, Prisma db push

### 2.4. Phan tich du lieu & Ho tro quyet dinh
- Risk Analysis Engine: He thong danh gia rui ro da tieu chi (Thoi han SLA, tinh trang tai san, cong no, tai khoan chua thu hoi)
- Knowledge Base & Retrieval: He thong tro ly tra cuu quy che noi bo doanh nghiep (RAG Pattern)

### 2.5. Kiem thu tu dong (Test Automation)
- Test Runner: Vitest
- Integration Testing: Supertest
- Do bao phu: 25 test cases kiem tra toan dien API xac thuc, phan quyen va quy trinh nghiep vu

---

## 3. Phan quyen 7 nhom vai tro (RBAC Matrix)

He thong ap dung nghiem ngat nguyen tac phan tach trach nhiem (Segregation of Duties) va dac quyen toi thieu (Least Privilege):

| Nhom vai tro | Chuc nang duoc phep thuc hien | Gioi han quyen han (Khong duoc phep) |
| :--- | :--- | :--- |
| ADMIN | Quan tri nguoi dung, phan vai tro he thong, xem nhat ky kiem toan Audit Log, giam sat toan cuc. | Khong duoc sua xoa nhat ky Audit; khong can thiep vao ket qua danh gia chuyen mon cua Manager. |
| HR | Tiep nhan va duyet don nghi viec, khoi tao ho so, chon mau checklist ban giao, phe duyet cap nhan su, dong ho so. | Khong duoc tu y sua doi so no tai chinh cua Ke toan; khong phe duyet khi con su co nghiem trong chua giai quyet. |
| MANAGER | Tham dinh ly do nghi viec, chi dinh nguoi tiep nhan, kiem tra noi dung ban giao chuyen mon, phe duyet buoc 1. | Khong duoc tao tai khoan he thong; khong thay the IT thu hoi quyen so; khong xac nhan doi soat tai chinh. |
| IT | Quan ly tai khoan so (Email, VPN, Cloud, Jira, GitHub), thuc hien 1-click vo hieu hoa quyen, bao cao su co IT. | Khong can thiep vao don thoi viec; khong chinh sua so lieu luong/no; khong tu y dong ho so offboarding. |
| KE TOAN | Kiem tra tien tam ung, cong no thiet bi, chi phi ton dong, tinh tong khau tru ky luong cuoi, xac nhan doi soat. | Khong duyet don nghi viec; khong thu hoi quyen truy cap IT; khong dong ho so neu con cong no tranh chap. |
| HANH CHINH | Kiem tra tinh trang vat ly cua may tinh, man hinh, the tu, chia khoa phong; xac nhan thu hoi tai san phan cung. | Khong can thiep tai khoan so; khong tu y mien tru tien boi thuong thiet bi neu chua co phe duyet; khong duyet chuyen mon. |
| EMPLOYEE | Tu nop don nghi viec, lap phieu ban giao, ban giao tai lieu/repo, theo doi tien do va cac buoc phe duyet cua minh. | Khong duoc tu duyet don cua minh; khong xem ho so nguoi khac; khong tu bam xac nhan da thu hoi may tinh hay tai khoan. |

---

## 4. Cac phan he chuc nang chi tiet

### 4.1. Phan he Xac thuc va Ho so ca nhan
- Dang nhap he thong: Kiem tra email va mat khau ma hoa, cap phat Access Token (8 gio) va Refresh Token (7 ngay).
- Dang ky tai khoan: Nhan vien tu dang ky dinh danh, lien ket phong ban truc thuoc va chuc danh cong viec.
- Khoi phuc mat khau: Quy trinh 2 buoc su dung ma xac thuc dung mot lan (Token 15 phut) gui toi email nguoi dung.
- Ho so ca nhan (/profile): Xem ma nhan vien, don vi truc thuoc, vai tro he thong; cap nhat so dien thoai, vi tri cong tac va doi mat khau an toan.
- Quan ly tai khoan (/users): Danh rieng cho Admin/HR de tao tai khoan, phan quyen va bat/tat trang thai hoat dong.

### 4.2. Phan he Don xin nghi viec (/resignation)
- Nhan vien tao don truc tuyen gom: ly do nghi viec, ngay gui don, ngay lam viec cuoi cung, tai lieu dinh kem.
- Ma don duoc he thong sinh tu dong theo dinh dang RES-YYYY-XXXX.
- Cap quan ly (Manager) va Nhan su (HR) xem xet tham dinh:
  - Khi Phe duyet (Approve): Tu dong tao Ho so Thoi viec (Offboarding Request), khoi tao danh muc cong viec ban giao theo Task Template va sinh ban ghi doi soat tai chinh cho Ke toan.
  - Khi Tu choi (Reject): Ghi nhan ly do tu choi va phan hoi truc tiep cho nhan vien.

### 4.3. Phan he Ho so Thoi viec tap trung (/offboarding)
Giao dien tich hop 12 tab chuyen sau cho tung ho so:
1. Tong quan & Tien do: Thong tin moc thoi gian, chi so % hoan tat quy trinh tong hop.
2. Thong tin nhan vien: Chuc danh, phong ban, email, ma nhan vien.
3. Danh muc cong viec: Danh sach nhiem vu can ban giao, nguoi phu trach, han xu ly (SLA).
4. Thu hoi tai san: Danh muc may tinh, thiet bi dang giu, tinh trang vat ly va nut xac nhan thu hoi.
5. Thu hoi tai khoan IT: Danh sach tai khoan he thong, trang thai kich hoat va nut 1-click vo hieu hoa.
6. Doi soat tai chinh: Hien thi chi tiet tam ung, no thiet bi, chi phi ton dong, tong khau tru va trang thai quyet toan.
7. Su co & Ngoai le: Danh sach su co phat sinh trong qua trinh ban giao, muc do uu tien va bien ban xu ly.
8. Tai lieu & Minh chung: Tai len bien ban ban giao, bien ban kiem ke thiet bi, cam ket bao mat.
9. Chuoi phe duyet: Tien trinh duyet 4 cap (Manager -> IT -> Ke toan -> HR).
10. Phan tich AI & Rui ro: Ket qua danh gia muc do rui ro (Low/Medium/High), thieu sot minh chung va de xuat xu ly.
11. Trao doi noi bo: Keng trao doi thong tin truc tiep giua cac phong ban ve tung ho so.
12. Nhat ky hoat dong: Nhat ky ghi vet toan bo thao tac lien quan toi ho so.

### 4.4. Phan he Doi soat va Quyet toan tai chinh (/finance)
- Danh rieng cho phong Ke toan va Ban Giam doc.
- Quan ly 4 tham so tai chinh:
  - Tien tam ung cong tac phi chua hoan ung.
  - Cong no boi thuong thiet bi, the tu bi mat hoac hu hong.
  - Chi phi chua thanh toan (hoa don tiep khach, mua dung cu hop le).
  - Tong tien khau tru = Tam ung + No thiet bi + Chi phi chua thanh toan.
- Trang thai doi soat: PENDING (Cho doi soat), CLEARED (Da quyet toan xong), DISPUTED (Tranh chap).
- Luu vet nguoi thuc hien (clearedBy) va thoi gian thuc hien (clearedAt).

### 4.5. Phan he Quan ly Su co va Ngoai le (/exceptions)
- Tiep nhan va giai quyet cac tinh huong phat sinh ngoai quy trinh chuan:
  - ASSET_LOST: Mat mat, hu hong may tinh xach tay, thiet bi cong ty.
  - ACCOUNT_BLOCKED: Loi ky thuat trong viec xoa/thu hoi tai khoan dich vu dam may.
  - HANDOVER_DELAYED: Nhan vien ban giao cham tre, nguoi nhan vang mat.
  - DEBT_UNRESOLVED: Tranh chap ve cac khoan tam ung va chi phi.
- Phan loai muc do uu tien: CRITICAL, HIGH, MEDIUM, LOW.
- Ghi nhan bien ban giai quyet hoac quyet dinh mien tru trach nhiem (RESOLVED / EXEMPTED).

### 4.6. Phan he Nhat ky Kiem toan he thong (/audit-logs)
- Ghi nhan tu dong toan bo hanh dong quan trong tren he thong (Non-repudiation).
- Xem chi tiet bien dong du lieu (Audit Diff): So sanh gia tri truoc khi sua (oldValue) va gia tri sau khi sua (newValue) duoi dinh dang JSON.
- Ghi nhan dinh danh nguoi thao tac, dia chi IP, thoi gian chinh xac va ma ho so lien quan.

### 4.7. Phan he Bao cao va Thong ke (/reports)
- Tong hop so lieu toan doanh nghiep: Ty le nghi viec theo phong ban, thoi gian hoan tat ban giao trung binh, ty le dat hanh muc SLA.
- Ho tro xuat du lieu va in an bao cao tong ket.

---

## 5. Quy trinh van hanh nghiep vu tieu chuan (Business Workflow)

```
[Buoc 1: Khoi tao]
Nhan vien nop Don xin nghi viec tren he thong (/resignation).
Hoac HR tao truc tiep Ho so thoi viec (/offboarding/new).

[Buoc 2: Phe duyet chu truong]
Manager phong ban va HR xem xet ly do va ngay lam viec cuoi cung.
Khi phe duyet, he thong tu dong khoi tao checklist ban giao va ho so tai chinh.

[Buoc 3: Trien khai ban giao da phong ban]
- Nhan vien lap phieu ban giao chuyen mon, tai lieu va ma nguon (/handovers).
- Hanh chinh kiem tra tinh trang thiet bi va thu hoi phan cung (/assets).
- IT thu hoi tai khoan email, VPN, AWS, Jira (/access).
- Ke toan kiem tra cong no, tam ung va xac dinh tong tien khau tru (/finance).

[Buoc 4: Xu ly ngoai le & Danh gia rui ro]
- Ghi nhan va xu ly cac su co mat thiet bi, kiet quyen hay tranh chap (/exceptions).
- Cong cu AI quet ho so, canh bao rui ro va yeu cau bo sung minh chung con thieu.

[Buoc 5: Phe duyet da cap]
Cac cap tham quyen (Manager -> IT -> Ke toan -> HR) xac nhan hoan tat trach nhiem.

[Buoc 6: Dong ho so va Luu tru kiem toan]
HR xac nhan dong ho so chinh thuc. Toan bo thao tac duoc luu vet vao Audit Log.
```

---

## 6. Huong dan cai dat va Van hanh

### 6.1. Yeu cau moi truong
- Node.js: Phien ban 18.0 tro len
- MySQL Database: Phien ban 8.0 tro len
- Trinh quan ly goi: npm hoac yarn

### 6.2. Cau hinh Co so du lieu
1. Tao co so du lieu tren MySQL:
```sql
CREATE DATABASE exitcontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
2. Thiet lap chuoi ket noi trong tep `server/.env`:
```env
PORT=5050
DATABASE_URL="mysql://root:password@127.0.0.1:3306/exitcontrol"
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
```

### 6.3. Khoi tao Backend
```bash
cd server
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```
Backend API se khoi chay tai dia chi: `http://localhost:5050`
Tai lieu API Swagger co san tai: `http://localhost:5050/api-docs`

### 6.4. Khoi tao Frontend
1. Thiet lap bien moi truong trong tep `client/.env`:
```env
VITE_API_URL=http://localhost:5050/api/v1
```
2. Cai dat va khoi chay ung dung:
```bash
cd client
npm install
npm run dev
```
Frontend Web App se khoi chay tai dia chi: `http://localhost:5173`

---

## 7. Tai khoan kiem thu mau theo vai tro

He thong da duoc khoi tao san du lieu mau de kiem thu toan bo cac vai tro:

| Vai tro | Email dang nhap | Mat khau | Pham vi kiem thu |
| :--- | :--- | :--- | :--- |
| ADMIN | admin@exitcontrol.vn | Password123! | Toan quyen he thong, quan tri user, xem toan bo Audit Log |
| HR | hr@exitcontrol.vn | Password123! | Duyet don thoi viec, dieu phoi tien do, phe duyet cap Nhan su |
| MANAGER | manager@exitcontrol.vn | Password123! | Tham dinh don cap duoi, duyet phieu ban giao chuyen mon |
| IT | it@exitcontrol.vn | Password123! | Thu hoi tai khoan, vo hieu hoa quyen he thong, tao ngoai le IT |
| KE TOAN | ketoan@exitcontrol.vn | Password123! | Kiem tra tam ung, tinh cong no thiet bi, quyet toan tai chinh |
| EMPLOYEE | employee@exitcontrol.vn | Password123! | Nop don thoi viec, lap phieu ban giao, theo doi tien do ca nhan |

---

## 8. Ket qua kiem thu tu dong (Test Results)

He thong tich hop bo kiem thu tu dong voi 25 test cases bao phu 100% cac nghiep vu trong tam:
- Kiem tra Authentication & Token Security: Dang nhap, dang ky moi, quen mat khau, reset token.
- Kiem tra User Management: Quan tri vien tao tai khoan, phan vai tro, khoa mo tai khoan.
- Kiem tra Enterprise Workflow: Nhan vien nop don -> HR/Manager duyet -> He thong tu dong tao ho so Offboarding -> Ke toan doi soat cong no -> Ghi nhan va giai quyet su co ngoai le -> Truy van nhat ky Audit -> Cap nhat Profile ca nhan.

Lenh thuc thi kiem thu:
```bash
cd server
npm test
```
Ket qua: 25/25 test cases passed (100%).

---

## 9. Ket luan

EXITCONTROL dap ung day du cac tieu chuan cua mot he thong phan mem quan tri nhan su thuc te trong doanh nghiep, ket hop chat che giua quy trinh quan ly, bao mat thong tin, kiem soat tai chinh va nhat ky kiem toan toan ven.
