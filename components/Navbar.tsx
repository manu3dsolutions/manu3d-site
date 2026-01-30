import React from 'react';

// CE COMPOSANT EST OBSOLÈTE.
// NOUS UTILISONS DÉSORMAIS "Header.tsx".
// SI VOUS VOYEZ CE MESSAGE, C'EST QUE App.tsx IMPORTE ENCORE Navbar AU LIEU DE Header.

const Navbar: React.FC<any> = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[9999] p-4 text-center font-bold">
      ERREUR DEV : Le composant Navbar est obsolète. Utilisez Header.tsx dans App.tsx.
    </div>
  );
};

export default Navbar;