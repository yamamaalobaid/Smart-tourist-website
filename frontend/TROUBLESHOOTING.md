## حل مشاكل npm install

إذا واجهت مشاكل في تثبيت الـ dependencies، جرب الخطوات التالية:

### 1. مسح الـ cache
```bash
npm cache clean --force
```

### 2. حذف node_modules و package-lock.json
```bash
rm -r node_modules
rm package-lock.json
```

### 3. إعادة التثبيت
```bash
npm install
```

### 4. إذا استمرت المشاكل، استخدم npm registry بديل
```bash
npm install --registry https://registry.npm.taobao.org
```

### 5. تشغيل التطبيق
```bash
npm run dev
```

### ملاحظات مهمة:
- تأكد من أن Node.js و npm مثبتة:
  ```bash
  node --version
  npm --version
  ```

- إذا كنت خلف proxy:
  ```bash
  npm config set proxy http://[user]:[passwd]@[proxy]:[port]
  npm config set https-proxy http://[user]:[passwd]@[proxy]:[port]
  ```

- للتشغيل بدون تثبيت (استخدم الملفات الموجودة فقط):
  ```bash
  npm run dev --legacy-peer-deps
  ```

---

**إذا استمرت المشاكل:**
- اتأكد من الاتصال بالإنترنت
- جرب تثبيت الـ dependencies واحدة تلو الأخرى
- استخدم إصدار Node.js أحدث (LTS)
