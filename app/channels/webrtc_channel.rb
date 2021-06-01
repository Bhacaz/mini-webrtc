class WebrtcChannel < ApplicationCable::Channel
  def subscribed
    stream_from "video_call"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
    ActionCable.server.broadcast('video_call', data)
  end
end
