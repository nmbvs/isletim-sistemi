[org 0x7c00]

; 1. ADIM: Ekranı temizle ve arka planı MAVİ, yazıları BEYAZ yap
mov ah, 0x06    ; Ekrani kaydirma/temizleme fonksiyonu
mov al, 0       ; Tum ekrani temizle
mov bh, 0x1F    ; 1=Mavi arka plan, F=Beyaz yazi rengi (Renk kodu)
mov cx, 0       ; Ust sol kose (0,0)
mov dx, 0x184F  ; Alt sag kose (24,79)
int 0x10        ; BIOS video kesmesini cagir (ekrani guncelle)

; 2. ADIM: Kursoru (imleci) ekranin en sol ustunesine (0,0) tasi
mov ah, 0x02    ; Imlec ayarlama fonksiyonu
mov bh, 0       ; Sayfa 0
mov dx, 0       ; Satir 0, Sutun 0
int 0x10

; 3. ADIM: Karsilama uyarimizi ekrana bastir (dongu ile)
mov si, mesaj   ; 'mesaj' isimli metnin baslangic adresini al

mesaj_yaz:
    mov al, [si]    ; Siradaki harfi AL yazmacina al
    cmp al, 0       ; Eger harf 0 (metin sonu) ise yazdirma biter
    je klavye_bekle ; Metin bittiyse klavye okumaya zıpla (jump equal)
    mov ah, 0x0E    ; Ekrana harf basma fonksiyonu
    int 0x10
    inc si          ; Bir sonraki harfe gec
    jmp mesaj_yaz   ; Donguyu basa sar

; 4. ADIM: Kullanici her tusa bastiginda onu ekranda goster
klavye_bekle:
    mov ah, 0x00    ; Klavyeden tus bekleme fonksiyonu
    int 0x16        ; BIOS klavye kesmesini cagir (Basilan tus AL'ye duser)

    ; Gelen tus Enter (0x0D kodu) ise ozel islem yapip alt satira inecegiz
    cmp al, 0x0D
    je alt_satir

    ; Enter degilse (normal bir harfse) o harfi aninda ekrana bas
    mov ah, 0x0E
    int 0x10
    jmp klavye_bekle ; Bir sonraki harfi dinlemek icin donguye don

alt_satir:
    mov ah, 0x0E
    mov al, 0x0D    ; CR (Satir basi - Carriage Return)
    int 0x10
    mov al, 0x0A    ; LF (Alt satir - Line Feed)
    int 0x10
    jmp klavye_bekle

; Hafizada tuttugumuz mesajlar (0x0D, 0x0A alt satira gecmektir, 0 metin sonudur)
mesaj db 'Harika! Kendi Isletim Sistemine Hos Geldin!', 0x0D, 0x0A
      db 'Hocaya gostermek icin klavyeden istedigini yazabilirsin:', 0x0D, 0x0A, 0x0D, 0x0A, 0

times 510-($-$$) db 0  ; Geri kalan bosluklari 510. bayta kadar sifirla doldur
dw 0xAA55              ; Bootloader imzasi (Vazgecilmezimiz!)
