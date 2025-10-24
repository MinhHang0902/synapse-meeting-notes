"use client"; // Bật nếu bạn sẽ thêm onClick/drag-drop handler sau

export default function UploadMinute() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Start Your Meeting Minutes</h1>
                    <p className="text-lg text-muted-foreground">
                        Upload audio files, import transcripts, or record meetings directly. Our AI will automatically generate
                        comprehensive meeting minutes with action items and key decisions.
                    </p>
                </div>

                {/* Upload Audio & Transcript Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        <h2 className="text-xl font-bold text-foreground">Upload Audio & Transcript</h2>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white hover:border-gray-400 transition-colors">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                        </svg>
                        <p className="text-lg font-semibold text-foreground mb-2">Drag and drop your files here</p>
                        <p className="text-sm text-muted-foreground mb-4">or</p>
                        <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                            Browse Files
                        </button>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-medium text-foreground mb-2">Supports:</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {["MP3", "WAV", "M4A", "OGG", "TXT", "MD"].map((format) => (
                                <span key={format} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                                    {format}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Audio files or text transcripts</p>
                    </div>
                </div>

                {/* Record Meeting Realtime Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
                            />
                        </svg>
                        <h2 className="text-xl font-bold text-foreground">Record Meeting Realtime</h2>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-12a7 7 0 00-7 7m7-7a7 7 0 017 7"
                            />
                        </svg>
                        <p className="text-lg font-semibold text-foreground mb-6">Ready to record</p>
                        <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                            Start Recording
                        </button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">Real-time transcription and AI-powered minute generation</p>
                </div>

                {/* Privacy Notice */}
                <div className="text-center mt-16">
                    <p className="text-sm text-muted-foreground">
                        Your files are processed securely. We respect your privacy and data security.
                    </p>
                </div>
            </div>
        </div>
    );
}
