"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";
import styles from "./BarcodeScanner.module.css";

/* ------------------------------------------------------------------ */
/*  BarcodeDetector type declarations (not yet in lib.dom)             */
/* ------------------------------------------------------------------ */

type BarcodeFormat =
  | "aztec"
  | "code_128"
  | "code_39"
  | "code_93"
  | "codabar"
  | "data_matrix"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "pdf417"
  | "qr_code"
  | "upc_a"
  | "upc_e";

interface DetectedBarcode {
  readonly rawValue: string;
  readonly format: BarcodeFormat;
  readonly boundingBox: DOMRectReadOnly;
  readonly cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorInstance {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: BarcodeFormat[] }): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<BarcodeFormat[]>;
}

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface ScanResult {
  /** The decoded string content of the barcode / QR code. */
  rawValue: string;
  /** The barcode symbology that was detected (e.g. "qr_code"). */
  format: string;
  /** Bounding rectangle of the detected code within the video frame. */
  boundingBox?: DOMRectReadOnly;
}

export interface BarcodeScannerProps {
  /** Called when a barcode or QR code is successfully detected. */
  onScan: (result: ScanResult) => void;
  /** Called when an error occurs (camera access, detection failure, etc.). */
  onError?: (error: Error) => void;
  /** Barcode symbologies to detect. @default ['qr_code','ean_13','ean_8','code_128'] */
  formats?: BarcodeFormat[];
  /** Which device camera to prefer. @default 'environment' */
  facingMode?: "user" | "environment";
  /** Milliseconds between scan attempts. @default 500 */
  scanInterval?: number;
  /** Enable or disable scanning without unmounting. @default true */
  active?: boolean;
  /** Render the viewfinder overlay on top of the camera feed. @default true */
  showViewfinder?: boolean;
  /** Additional CSS class on the root element. */
  className?: string;
  /** Inline styles on the root element. */
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  State machine for the scanner lifecycle                            */
/* ------------------------------------------------------------------ */

type ScannerState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "streaming" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_FORMATS: BarcodeFormat[] = [
  "qr_code",
  "ean_13",
  "ean_8",
  "code_128",
];

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  const w = globalThis as unknown as Record<string, unknown>;
  if (typeof w["BarcodeDetector"] === "function") {
    return w["BarcodeDetector"] as unknown as BarcodeDetectorConstructor;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BarcodeScanner({
  onScan,
  onError,
  formats = DEFAULT_FORMATS,
  facingMode = "environment",
  scanInterval = 500,
  active = true,
  showViewfinder = true,
  className,
  style,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [scannerState, setScannerState] = useState<ScannerState>({
    status: "idle",
  });

  /* Stabilise callbacks so effects don't re-fire on every render. */
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  /* ---- stop helpers ----------------------------------------------- */

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /* ---- scan one frame --------------------------------------------- */

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector) return;
    if (video.readyState < video.HAVE_ENOUGH_DATA) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const codes = await detector.detect(canvas);
      if (codes.length > 0) {
        const first = codes[0];
        onScanRef.current({
          rawValue: first.rawValue,
          format: first.format,
          boundingBox: first.boundingBox,
        });
      }
    } catch (err) {
      /* Detection errors are non-fatal; keep scanning. */
      onErrorRef.current?.(
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, []);

  /* ---- main lifecycle effect -------------------------------------- */

  useEffect(() => {
    /* When inactive, tear down everything. */
    if (!active) {
      stopInterval();
      stopStream();
      setScannerState({ status: "idle" });
      return;
    }

    /* Check API support first. */
    const Ctor = getBarcodeDetector();
    if (!Ctor) {
      setScannerState({ status: "unsupported" });
      return;
    }

    let cancelled = false;

    async function start() {
      setScannerState({ status: "requesting" });

      try {
        /* Instantiate detector. */
        const Ctor = getBarcodeDetector();
        if (!Ctor || cancelled) return;
        detectorRef.current = new Ctor({ formats });

        /* Request camera. */
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        if (cancelled) return;
        setScannerState({ status: "streaming" });

        /* Begin periodic scanning. */
        intervalRef.current = setInterval(() => {
          void scanFrame();
        }, scanInterval);
      } catch (err) {
        if (cancelled) return;
        const error =
          err instanceof Error ? err : new Error(String(err));
        setScannerState({ status: "error", message: error.message });
        onErrorRef.current?.(error);
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopInterval();
      stopStream();
    };
    /* Re-run when user toggles activity or changes camera/format config. */
  }, [active, facingMode, formats, scanInterval, stopInterval, stopStream, scanFrame]);

  /* ---- retry handler ---------------------------------------------- */

  const handleRetry = useCallback(() => {
    setScannerState({ status: "idle" });
    /* Toggling to idle then back triggers the effect. We use a microtask
       so that React sees both state transitions.                        */
    queueMicrotask(() => setScannerState({ status: "requesting" }));
    /* The effect is keyed on `active` so we simply force a re-render by
       relying on the component's existing active prop.  For a manual
       retry the parent should toggle `active`.  As a convenience, we
       re-invoke start inline: */
    const Ctor = getBarcodeDetector();
    if (!Ctor) {
      setScannerState({ status: "unsupported" });
      return;
    }

    (async () => {
      try {
        detectorRef.current = new Ctor({ formats });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setScannerState({ status: "streaming" });
        intervalRef.current = setInterval(() => {
          void scanFrame();
        }, scanInterval);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(String(err));
        setScannerState({ status: "error", message: error.message });
        onErrorRef.current?.(error);
      }
    })();
  }, [facingMode, formats, scanInterval, scanFrame]);

  /* ---- render ----------------------------------------------------- */

  const outerClasses = [styles.container, className]
    .filter(Boolean)
    .join(" ");

  /* Unsupported browser */
  if (scannerState.status === "unsupported") {
    return (
      <div className={outerClasses} style={style}>
        <div className={`${styles.stateOverlay} ${styles.unsupportedState}`}>
          <span className={styles.stateIcon} role="img" aria-label="Warning">
            &#x26A0;
          </span>
          <h2 className={styles.stateTitle}>BarcodeDetector Not Supported</h2>
          <p className={styles.stateDescription}>
            Your browser does not support the BarcodeDetector API. Please use
            Chrome or Edge, or add a polyfill:
          </p>
          <code className={styles.codeHint}>
            npm i barcode-detector
          </code>
        </div>
      </div>
    );
  }

  /* Camera permission request */
  if (scannerState.status === "idle" || scannerState.status === "requesting") {
    return (
      <div className={outerClasses} style={style}>
        <div className={styles.stateOverlay}>
          <span className={styles.stateIcon} role="img" aria-label="Camera">
            &#x1F4F7;
          </span>
          <h2 className={styles.stateTitle}>Camera Access Required</h2>
          <p className={styles.stateDescription}>
            {scannerState.status === "requesting"
              ? "Waiting for camera permission..."
              : "Grant camera access to start scanning barcodes and QR codes."}
          </p>
        </div>
      </div>
    );
  }

  /* Error state */
  if (scannerState.status === "error") {
    return (
      <div className={outerClasses} style={style}>
        <div className={`${styles.stateOverlay} ${styles.errorState}`}>
          <span className={styles.stateIcon} role="img" aria-label="Error">
            &#x274C;
          </span>
          <h2 className={styles.stateTitle}>Camera Error</h2>
          <p className={styles.stateDescription}>{scannerState.message}</p>
          <button
            type="button"
            className={styles.stateButton}
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* Streaming state — camera feed with optional viewfinder. */
  return (
    <div className={outerClasses} style={style}>
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className={styles.canvas} />

      {showViewfinder && (
        <div className={styles.viewfinder} aria-hidden="true">
          <div className={styles.viewfinderCutout}>
            <span className={styles.cornerBottomLeft} />
            <span className={styles.cornerBottomRight} />
            <div className={styles.scanLine} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
