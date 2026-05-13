import { useEffect } from "react";

/**
 * 마운트되는 동안 <meta name="robots" content="noindex, nofollow"> 를 head 에 삽입.
 * 어드민 등 검색엔진 인덱싱이 불필요한 라우트에서 호출.
 */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);
}
