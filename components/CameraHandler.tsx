import React, { useEffect, useRef, useState } from 'react';
import { connectToGemini } from '../services/geminiLive';

interface CameraHandlerProps {
  onExpansionChange: (val: number) => void;
  onConnectionChange: (status: boolean) => void;
}

const FRAME_RATE = 2; // Frames per second to send (Lower to save bandwidth/quota, increase for responsiveness)
const JPEG_QUALITY = 0.5;

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

const CameraHandler: React.FC<CameraHandlerProps> = ({ onExpansionChange, onConnectionChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null); // To store session promise
  const intervalRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false // We don't need audio input for this specific visualization control
        });
        
        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize Gemini Live
        if(process.env.API_KEY) {
             sessionRef.current = await connectToGemini(
                process.env.API_KEY,
                (expansion) => {
                    if(mounted) onExpansionChange(expansion);
                },
                (status) => {
                    if(mounted) onConnectionChange(status);
                }
            );

            // Start streaming frames
            startFrameStreaming();
        } else {
            setError("API Key missing");
        }

      } catch (err) {
        console.error("Camera/Gemini Error:", err);
        setError("Failed to access camera or connect to AI.");
        onConnectionChange(false);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startFrameStreaming = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !sessionRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== 4) return;

      canvas.width = video.videoWidth * 0.5; // Downscale for performance
      canvas.height = video.videoHeight * 0.5;
      
      // Flip horizontally for mirror effect (optional, but good for UX)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const base64 = await blobToBase64(blob);
        
        // Send to Gemini
        sessionRef.current.then((session: any) => {
            try {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            } catch(e) {
                console.error("Error sending frame:", e);
            }
        });

      }, 'image/jpeg', JPEG_QUALITY);

    }, 1000 / FRAME_RATE);
  };

  return (
    <div className="hidden">
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {error && <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-50">{error}</div>}
    </div>
  );
};

export default CameraHandler;
