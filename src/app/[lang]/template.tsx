import { ViewTransition } from "react";

// Il template si rimonta a ogni cambio pagina: il contenuto vecchio sfuma e il nuovo sale piano.
// L'header sta nel layout, quindi resta fermo.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
