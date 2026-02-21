"use client"

import * as React from "react"
import {
    ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, Sun, Contrast,
    Maximize2, Minimize2, Ruler, Expand, Shrink
} from "lucide-react"
import { Button } from "@/components/ui/basic"

interface ImageViewerProps {
    imageSrc?: string | null;
    className?: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    images?: string[]; // For filmstrip support
}

interface MeasurementPoint {
    x: number;
    y: number;
}

export function ImageViewer({ imageSrc, className, isCollapsed, onToggleCollapse, images = [] }: ImageViewerProps) {
    const [scale, setScale] = React.useState(1);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [brightness, setBrightness] = React.useState(100);
    const [contrast, setContrast] = React.useState(100);
    const [rotation, setRotation] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const [measurementMode, setMeasurementMode] = React.useState(false);
    const [measurementPoints, setMeasurementPoints] = React.useState<MeasurementPoint[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const imageRef = React.useRef<HTMLImageElement>(null);

    const activeImage = images.length > 0 ? images[currentImageIndex] : imageSrc;

    const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 5));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
    const handleRotateLeft = () => setRotation(r => (r - 90) % 360);
    const handleRotateRight = () => setRotation(r => (r + 90) % 360);

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setBrightness(100);
        setContrast(100);
        setRotation(0);
        setMeasurementPoints([]);
        setMeasurementMode(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (measurementMode) {
            // Handle measurement click
            const rect = imageRef.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                if (measurementPoints.length === 0) {
                    setMeasurementPoints([{ x, y }]);
                } else if (measurementPoints.length === 1) {
                    setMeasurementPoints([...measurementPoints, { x, y }]);
                }
            }
        } else {
            // Handle pan
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && !measurementMode) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const toggleMeasurementMode = () => {
        setMeasurementMode(!measurementMode);
        setMeasurementPoints([]);
    };

    const calculateDistance = () => {
        if (measurementPoints.length === 2) {
            const dx = measurementPoints[1].x - measurementPoints[0].x;
            const dy = measurementPoints[1].y - measurementPoints[0].y;
            return Math.sqrt(dx * dx + dy * dy).toFixed(2);
        }
        return null;
    };

    const distance = calculateDistance();

    return (
        <div className={`relative bg-black overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : className}`}>
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-fit max-w-[95%]">
                <div className="flex flex-wrap items-center justify-center gap-2 bg-bg-panel/90 border border-border-primary p-2 rounded-lg shadow-xl backdrop-blur-sm">
                    <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
                        <ZoomIn className="w-5 h-5 text-text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
                        <ZoomOut className="w-5 h-5 text-text-primary" />
                    </Button>
                    <div className="hidden sm:block w-px h-6 bg-border-primary mx-1" />

                    {/* Rotation Controls */}
                    <Button variant="ghost" size="icon" onClick={handleRotateLeft} title="Rotate Left">
                        <RotateCcw className="w-4 h-4 text-text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRotateRight} title="Rotate Right">
                        <RotateCw className="w-4 h-4 text-text-primary" />
                    </Button>
                    <div className="hidden sm:block w-px h-6 bg-border-primary mx-1" />

                    {/* Measurement Tool */}
                    <Button
                        variant={measurementMode ? "default" : "ghost"}
                        size="icon"
                        onClick={toggleMeasurementMode}
                        title="Measurement Tool"
                    >
                        <Ruler className="w-4 h-4" />
                    </Button>
                    <div className="hidden sm:block w-px h-6 bg-border-primary mx-1" />

                    <Button variant="ghost" size="icon" onClick={handleReset} title="Reset">
                        <RotateCcw className="w-4 h-4 text-text-primary" />
                    </Button>

                    {/* Fullscreen Toggle */}
                    <div className="hidden sm:block w-px h-6 bg-border-primary mx-1" />
                    <Button
                        variant={isFullscreen ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                    </Button>

                    <div className="bg-border-primary h-px w-full my-1 sm:hidden"></div>

                    {/* Filters (Wrapped on small screens) */}
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <div className="flex flex-col items-center gap-1">
                            <Sun className="w-3 h-3 text-text-muted" />
                            <input
                                type="range"
                                min="50" max="150"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-20 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-1 ml-2">
                            <Contrast className="w-3 h-3 text-text-muted" />
                            <input
                                type="range"
                                min="50" max="150"
                                value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                                className="w-20 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurement Display */}
            {measurementMode && measurementPoints.length > 0 && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 bg-bg-panel/90 border border-border-primary px-4 py-2 rounded-lg shadow-xl backdrop-blur-sm pointer-events-none">
                    <p className="text-xs text-text-primary">
                        {measurementPoints.length === 1 ? "Click second point" : `Distance: ${distance} px`}
                    </p>
                </div>
            )}

            {/* Image Canvas */}
            <div
                ref={containerRef}
                className={`flex-1 flex items-center justify-center ${measurementMode ? 'cursor-crosshair' : 'cursor-move'} overflow-hidden h-full w-full ${isCollapsed ? 'opacity-50 pointer-events-none' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {activeImage ? (
                    <div className="relative">
                        <img
                            ref={imageRef}
                            src={activeImage}
                            alt="Radiology Scan"
                            className="max-w-none transition-transform duration-75"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                                filter: `brightness(${brightness}%) contrast(${contrast}%)`
                            }}
                            draggable={false}
                        />
                        {/* Measurement Line */}
                        {measurementMode && measurementPoints.length === 2 && (
                            <svg
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                            >
                                <line
                                    x1={measurementPoints[0].x}
                                    y1={measurementPoints[0].y}
                                    x2={measurementPoints[1].x}
                                    y2={measurementPoints[1].y}
                                    stroke="#00ff00"
                                    strokeWidth="2"
                                />
                                <circle cx={measurementPoints[0].x} cy={measurementPoints[0].y} r="4" fill="#00ff00" />
                                <circle cx={measurementPoints[1].x} cy={measurementPoints[1].y} r="4" fill="#00ff00" />
                            </svg>
                        )}
                    </div>
                ) : (
                    <p className="text-text-muted">No image loaded</p>
                )}
            </div>

            {/* Filmstrip */}
            {images.length > 1 && !isCollapsed && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-bg-panel/90 border border-border-primary p-2 rounded-lg shadow-xl backdrop-blur-sm max-w-[80%] overflow-x-auto">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentImageIndex(index);
                                setMeasurementPoints([]);
                            }}
                            className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${index === currentImageIndex
                                ? 'border-primary-main scale-110'
                                : 'border-border-primary hover:border-primary-main/50'
                                }`}
                        >
                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Close Fullscreen Button (Top Right) - Easier access */}
            {isFullscreen && (
                <div className="absolute top-4 right-4 z-30">
                    <Button variant="default" size="icon" onClick={() => setIsFullscreen(false)} className="rounded-full shadow-lg">
                        <Shrink className="w-5 h-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
