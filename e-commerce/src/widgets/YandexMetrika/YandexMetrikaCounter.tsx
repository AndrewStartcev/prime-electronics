import {
  getYandexMetrikaInitScript,
  YANDEX_METRIKA_WATCH_URL,
} from "./analytics";

export function YandexMetrikaCounter() {
  return (
    <>
      <script
        id="yandex-metrika-counter"
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: getYandexMetrikaInitScript() }}
      />
      <noscript>
        <div>
          <img
            src={YANDEX_METRIKA_WATCH_URL}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
