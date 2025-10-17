import { Global, css } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
          'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #0a1a0e;
        color: white;
        overflow-x: hidden;
      }

      #__next {
        min-height: 100vh;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button {
        font-family: inherit;
      }

      input,
      textarea {
        font-family: inherit;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #32CD32 0%, #00FF00 100%);
      }

      /* Selection styles */
      ::selection {
        background: rgba(34, 139, 34, 0.3);
        color: white;
      }

      ::-moz-selection {
        background: rgba(34, 139, 34, 0.3);
        color: white;
      }

      /* Focus styles */
      button:focus,
      input:focus,
      textarea:focus {
        outline: 2px solid #32CD32;
        outline-offset: 2px;
      }

      /* Animations */
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(34, 139, 34, 0.2);
        }
        50% {
          box-shadow: 0 0 30px rgba(34, 139, 34, 0.4);
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      /* Utility classes */
      .glow {
        animation: glow 3s ease-in-out infinite;
      }

      .pulse {
        animation: pulse 2s ease-in-out infinite;
      }

      .shimmer {
        position: relative;
        overflow: hidden;
      }

      .shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmer 2s infinite;
      }
    `}
  />
);
