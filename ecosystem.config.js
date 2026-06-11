module.exports = {
  apps: [
    {
      name: "mytechnews-backend",
      // Path to the virtualenv uvicorn executable on Windows
      script: ".\\venv\\Scripts\\uvicorn.exe",
      args: "backend.app.main:app --host 127.0.0.1 --port 3001",
      interpreter: "none",
      watch: false,
      env: {
        PYTHONPATH: "./backend"
      }
    },
    {
      name: "mytechnews-frontend",
      // PM2's built-in static file server to serve the React distribution
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./frontend/dist",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true"
      }
    }
  ]
};
