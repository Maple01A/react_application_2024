module Api
  class EventsController < ApplicationController
    before_action :set_event, only: [:show, :update, :destroy]
    
    # イベント一覧
    def index
      @events = Event.all
      render json: @events
    end
    
    # イベント詳細
    def show
      render json: @event
    end
    
    # イベント作成
    def create
      @event = Event.new(event_params)
      
      if @event.save
        render json: @event, status: :created
      else
        render json: { error: @event.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    # イベント更新
    def update
      if @event.update(event_params)
        render json: @event
      else
        render json: { error: @event.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    # イベント削除
    def destroy
      @event.destroy
      head :no_content
    end
    
    private
    
    def set_event
      @event = Event.find(params[:id])
    end
    
    def event_params
      params.require(:event).permit(:title, :date, :description, :status)
    end
  end
end