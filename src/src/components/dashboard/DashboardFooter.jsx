import React from 'react';
import { Instagram } from 'lucide-react';

const DashboardFooter = () => {
  return (
    <footer className="text-center mt-12 py-8 border-t border-primary/10">
      <p className="text-sm text-muted-foreground mb-3">Desenvolvido com ❤️ para PriNutriApp</p>
      <a 
        href="https://www.instagram.com/prifeitosanutri" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center text-primary hover:text-accent transition-colors font-semibold"
      > 
        <Instagram className="w-5 h-5 mr-2"/> 
        Siga a Nutri no Instagram! 
      </a>
    </footer>
  );
};

export default DashboardFooter;