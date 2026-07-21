"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

function centerCropNoAspect(mediaWidth: number, mediaHeight: number) {
    return centerCrop(
        {
            unit: '%',
            width: 90,
            height: 90,
            x: 5,
            y: 5
        },
        mediaWidth,
        mediaHeight,
    );
}

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    aspect?: number;
    title: string;
    onSave: (base64String: string) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, onClose, imageSrc, aspect = 1, onSave, title }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Reset crop state when the modal opens with a new image
    useEffect(() => {
        if (isOpen) {
            setCrop(undefined);
            setCompletedCrop(null);
        }
    }, [isOpen, imageSrc]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
            setCrop(centerCropNoAspect(width, height));
        }
    };

    const handleSave = async () => {
        if (!completedCrop || !imgRef.current) return;
        setIsSaving(true);

        try {
            // Get cropped image as base64 string directly on client-side
            const canvas = document.createElement('canvas');
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            
            canvas.width = completedCrop.width * scaleX;
            canvas.height = completedCrop.height * scaleY;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(
                    imgRef.current,
                    completedCrop.x * scaleX,
                    completedCrop.y * scaleY,
                    completedCrop.width * scaleX,
                    completedCrop.height * scaleY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Convert to base64
                const base64Image = canvas.toDataURL('image/jpeg', 0.9);
                onSave(base64Image);
            }
        } catch (e) {
            console.error('Error cropping image:', e);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1e0a2d] border-2 border-[#ff912d]/50 rounded-2xl shadow-[0_0_30px_rgba(255,145,45,0.2)] w-full max-w-md overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20">
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-white/50 hover:text-white transition-colors cursor-pointer"
                        disabled={isSaving}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Workspace */}
                <div className="p-4 flex items-center justify-center bg-black/40 h-[380px] overflow-hidden">
                    {imageSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect === 0 ? undefined : aspect}
                            circularCrop={aspect === 1}
                        >
                            <img
                                ref={imgRef}
                                alt="Crop preview"
                                src={imageSrc}
                                onLoad={onImageLoad}
                                className="max-h-[340px] w-auto max-w-full rounded-md object-contain"
                            />
                        </ReactCrop>
                    ) : (
                        <div className="text-white/50 font-medium text-sm">No image selected.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <button 
                        className="px-6 py-2 rounded-full font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button 
                        className="px-6 py-2 rounded-full font-bold text-white bg-[#ff912d] hover:bg-[#ff912d]/80 transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        onClick={handleSave}
                        disabled={isSaving || !completedCrop}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Check size={18} />
                        )}
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
