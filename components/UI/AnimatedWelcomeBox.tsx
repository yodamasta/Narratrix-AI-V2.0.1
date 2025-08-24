

import React from 'react';
import { APP_VERSION } from '../../constants'; // Import APP_VERSION

interface AnimatedWelcomeBoxProps {
  appName: string; // This prop is now less relevant for the H1, but kept for potential future use
}

const AnimatedWelcomeBox: React.FC<AnimatedWelcomeBoxProps> = ({ appName }) => {
  return (
    <div className="animated-welcome-box my-3"> {}
      <div className="animated-welcome-box-content"> {}
        <h1 className="text-teal-700 text-lg font-semibold mb-1">
          Narratrix-AI
          <sup className="text-[0.6em] font-medium ml-0.5 opacity-75 relative -top-[0.3em]">
            {APP_VERSION}
          </sup>
          {' '} : Votre Univers, Structuré. Votre Créativité, Décuplée.
        </h1>
        <p className="text-teal-600 text-sm mb-3">
          Pour commencer à forger votre monde et explorer ses possibilités :
        </p>

        <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600">
          <li>
            <strong className="text-teal-700 font-semibold">Convertissez vos notes :</strong> L'outil "Convertir Texte en JSON" (plus bas) utilise l'IA pour structurer vos idées.
          </li>
          <li>
            <strong className="text-teal-700 font-semibold">Chargez une Bible existante :</strong> Utilisez le sélecteur de fichier JSON ou collez son contenu ci-dessus.
          </li>
          <li>
            <strong className="text-teal-700 font-semibold">Besoin d'un modèle de départ ?</strong> Le bouton "Afficher le Modèle JSON" vous donne la structure de base à adapter.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AnimatedWelcomeBox;