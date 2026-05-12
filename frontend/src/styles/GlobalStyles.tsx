const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Noto+Serif+JP:wght@300;500;700&family=Quicksand:wght@300;400;500;700&display=swap');
      
      :root {
        --font-serif: 'Cinzel', serif;
        --font-jp: 'Noto Serif JP', serif;
        --font-sans: 'Quicksand', sans-serif;
      }

      body {
        font-family: var(--font-sans);
      }

      h1, h2, h3, h4, .font-serif {
        font-family: var(--font-serif);
      }
      
      .jp-text {
        font-family: var(--font-jp);
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #fdfbf7; 
      }
      ::-webkit-scrollbar-thumb {
        background: #e7e5e4; 
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #d6d3d1; 
      }

      /* Animations */
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      .animate-float {
        animation: float 4s ease-in-out infinite;
      }
      
      @keyframes petal-fall {
        0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(100vh) translateX(20px) rotate(360deg); opacity: 0; }
      }
      .petal {
        position: absolute;
        background: #fda4af;
        border-radius: 100% 0 100% 0;
        opacity: 0.8;
      }
      
      /* Modal Animation */
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out forwards;
      }
    `}
  </style>
);

export default GlobalStyles;