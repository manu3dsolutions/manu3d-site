// Fichier obsolète. Tout est géré dans le LiveContent.tsx à la racine.
import React from 'react';
export const LiveContentProvider = ({children}: any) => <>{children}</>;
export const useLiveContent = () => { console.warn("Old context used"); return {}; };