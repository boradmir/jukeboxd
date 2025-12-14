import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ZoomIn, ZoomOut, RotateCw, Check, Image as ImageIcon } from 'lucide-react';
import './AvatarUpload.css';

export default function AvatarUpload({
    currentAvatar,
    onUpload,
    onClose,
    isOpen = false,
    maxFileSize = 5 * 1024 * 1024, // 5MB
}) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    const handleFileSelect = useCallback((file) => {
        setError(null);

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        // Validate file size
        if (file.size > maxFileSize) {
            setError(`Dosya boyutu ${maxFileSize / 1024 / 1024}MB'dan küçük olmalı`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(file);
            setPreview(e.target.result);
            setZoom(1);
            setRotation(0);
            setPosition({ x: 0, y: 0 });
        };
        reader.readAsDataURL(file);
    }, [maxFileSize]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseDown = useCallback((e) => {
        if (!preview) return;
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        setIsDragging(true);
    }, [preview, position]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !preview) return;
        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    }, [isDragging, preview]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const generateCroppedImage = useCallback(() => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Output size 256x256
                const size = 256;
                canvas.width = size;
                canvas.height = size;

                // Clear and draw circular clip
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.clip();

                // Calculate draw parameters
                ctx.translate(size / 2, size / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.scale(zoom, zoom);
                ctx.translate(-size / 2 + position.x / 2, -size / 2 + position.y / 2);

                // Draw image centered
                const aspectRatio = img.width / img.height;
                let drawWidth, drawHeight;
                if (aspectRatio > 1) {
                    drawHeight = size;
                    drawWidth = size * aspectRatio;
                } else {
                    drawWidth = size;
                    drawHeight = size / aspectRatio;
                }

                ctx.drawImage(
                    img,
                    (size - drawWidth) / 2,
                    (size - drawHeight) / 2,
                    drawWidth,
                    drawHeight
                );

                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            };

            img.src = preview;
        });
    }, [preview, zoom, rotation, position]);

    const handleUpload = async () => {
        if (!preview) return;

        setIsUploading(true);
        setError(null);

        try {
            const blob = await generateCroppedImage();
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.jpg');

            await onUpload(formData);
            onClose();
        } catch (err) {
            setError('Yükleme başarısız oldu. Lütfen tekrar deneyin.');
        }

        setIsUploading(false);
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="avatar-upload-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="avatar-upload-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="avatar-upload-header">
                        <h3>Profil Fotoğrafı</h3>
                        <button className="avatar-upload-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="avatar-upload-content">
                        {!preview ? (
                            <div
                                className={`avatar-upload-dropzone ${isDragging ? 'dragging' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                    hidden
                                />
                                <div className="dropzone-icon">
                                    <Upload size={32} />
                                </div>
                                <p className="dropzone-text">
                                    Fotoğraf yüklemek için tıklayın<br />
                                    veya sürükleyip bırakın
                                </p>
                                <span className="dropzone-hint">
                                    PNG, JPG, GIF • Maks 5MB
                                </span>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="avatar-upload-preview"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <div className="preview-circle">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{
                                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`
                                            }}
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="preview-overlay" />
                                </div>

                                <div className="avatar-upload-controls">
                                    <div className="control-group">
                                        <button
                                            className="control-btn"
                                            onClick={handleZoomOut}
                                            disabled={zoom <= 0.5}
                                        >
                                            <ZoomOut size={18} />
                                        </button>
                                        <div className="zoom-slider">
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="3"
                                                step="0.1"
                                                value={zoom}
                                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            className="control-btn"
                                            onClick={handleZoomIn}
                                            disabled={zoom >= 3}
                                        >
                                            <ZoomIn size={18} />
                                        </button>
                                    </div>

                                    <button className="control-btn" onClick={handleRotate}>
                                        <RotateCw size={18} />
                                    </button>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="avatar-upload-error">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="avatar-upload-footer">
                        {preview ? (
                            <>
                                <button className="btn btn-secondary" onClick={handleReset}>
                                    Farklı Fotoğraf
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Yükleniyor...' : (
                                        <>
                                            <Check size={16} />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-secondary" onClick={onClose}>
                                İptal
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
