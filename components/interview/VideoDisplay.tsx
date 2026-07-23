interface VideoDisplayProps {
  isRecording: boolean;
}

export function VideoDisplay({ isRecording }: VideoDisplayProps) {
  return (
    <div className="relative flex items-center justify-center bg-zinc-900 rounded-2xl border border-border overflow-hidden aspect-[4/3] max-w-lg w-full mx-auto">
      {/* AI Interviewer Avatar / Placeholder */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-3xl font-bold">
          AI
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">AI Interviewer</p>
          <p className="text-sm text-zinc-500">Behavioral Interview</p>
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-full px-3 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-danger recording-pulse" />
          <span className="text-xs font-medium text-danger">Recording</span>
        </div>
      )}
    </div>
  );
}
