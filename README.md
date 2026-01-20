# почём

Конвертер валют (GEL, RUB, EUR, USD).

## Запуск

```bash
# Установить зависимости
npm install

# Запустить Expo
npm start
```

После запуска:
- Нажми `i` для iOS симулятора
- Нажми `a` для Android эмулятора
- Отсканируй QR-код в Expo Go на телефоне

## Нативная сборка

```bash
# iOS симулятор
npm run ios

# iOS на реальном устройстве
npm run ios -- --device

# Android
npm run android
```

Если нативные папки отсутствуют:
```bash
npm run prebuild
```

## Стек

- Expo 54
- React Native 0.81
- MobX
- TypeScript

## Архитектура

См. [CLAUDE.md](./CLAUDE.md) — Clean Architecture с портами и адаптерами.

```
src/
├── screens/        # Экраны
├── components/     # UI компоненты
├── core/           # Бизнес-логика (framework-agnostic)
├── infrastructure/ # Адаптеры (API, storage)
└── hooks/          # React хуки
```
