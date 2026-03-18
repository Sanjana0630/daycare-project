import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, Scissors } from 'lucide-react'
import getCroppedImg from '../utils/cropImage'

const CropModal = ({ isOpen, image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = (crop) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom) => {
        setZoom(zoom)
    }

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCrop = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
            // Create a file from the blob
            const croppedFile = new File([croppedImageBlob], 'cropped-photo.jpg', { type: 'image/jpeg' })
            onCropComplete(croppedFile)
        } catch (e) {
            console.error(e)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-purple-600 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Adjust Photo</h3>
                        <p className="text-purple-100 text-sm font-medium">Crop and zoom to perfectly frame the profile image</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative h-[400px] bg-gray-100">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteInternal}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                {/* Controls */}
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-6">
                        <ZoomOut size={20} className="text-gray-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <ZoomIn size={20} className="text-gray-400" />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCrop}
                            className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shadow-xl shadow-purple-200 flex items-center justify-center gap-2"
                        >
                            <Scissors size={18} />
                            Crop & Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CropModal
