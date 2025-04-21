# app/controllers/api/events_controller.rb
module Api
  class EventsController < ApplicationController
    protect_from_forgery with: :null_session
    
    # イベント一覧
    def index
      @events = Event.all
      render json: @events
    end
    
    # イベント詳細
    def show
      @event = Event.find(params[:id])
      render json: @event
    end
    
    # イベント作成
    def create
      @event = Event.new(event_params)
      
      if @event.save
        render json: @event, status: :created
      else
        render json: { error: @event.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    end
    
    # イベント更新
    def update
      @event = Event.find(params[:id])
      
      if @event.update(event_params)
        render json: @event
      else
        render json: { error: @event.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    end
    
    # イベント削除
    def destroy
      @event = Event.find(params[:id])
      @event.destroy
      head :no_content
    end
    
    private
    
    def event_params
      params.require(:event).permit(:title, :date, :description, :status)
    end
  end
end