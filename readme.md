# Slay Kick Winline

Браузерное расширение для [slay-award.ru](https://slay-award.ru/): блокирует загрузку картинок и видео с брендингом Winline и скрывает связанные карточки номинаций.

**Репозиторий:** [https://github.com/Remaderrg/winline-kick-out](https://github.com/Remaderrg/winline-kick-out)

## Установка

1. Скачай релиз или клонируй репозиторий.
2. Открой `chrome://extensions`.
3. Включи «Режим разработчика».
4. «Загрузить распакованное расширение» → выбери папку проекта.

## Сборка для магазина

```powershell
pwsh -File generate.ps1
```

Скрипт поднимет версию в `manifest.json` и положит zip в `builds-for-store/`.

## Что делает

- Блокирует сетевые запросы к ассетам Winline / hero / preloader-logo и др. (`rules.json`)

## Chrome Web Store

Готовые ассеты в `builds-for-store/chrome-store/`:

- `icon-128.png` — значок магазина 128×128
- `screenshot-1280x800.png` — скриншот 1280×800

Исходники логотипов SLAY — в `builds-for-store/assets/`.

## Лицензия

MIT — см. [LICENSE](LICENSE).
