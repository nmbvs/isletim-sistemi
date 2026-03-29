@echo off
echo islem baslatiliyor...
echo -------------------------
echo 1) NASM ile Bootloader derleniyor...
"C:\Users\bayca\AppData\Local\bin\NASM\nasm.exe" -f bin boot.asm -o boot.bin

if %errorlevel% neq 0 (
    echo [HATA] Derleme basarisiz oldu. NASM yuklu olmayabilir veya sistem yoluna eklenmemis olabilir.
    pause
    exit /b
)

echo 2) QEMU Emulatoru baslatiliyor...
"C:\Program Files\qemu\qemu-system-x86_64.exe" boot.bin

if %errorlevel% neq 0 (
    echo [HATA] QEMU baslatilamadi. QEMU yuklu olmayabilir veya sistem yoluna eklenmemis olabilir.
    pause
    exit /b
)

echo Islem basariyla tamamlandi.
pause
