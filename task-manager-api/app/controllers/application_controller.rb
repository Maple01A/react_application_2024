class ApplicationController < ActionController::API
  # API専用コントローラーの基底クラスを変更
  # ActionController::Baseから継承する必要がないため
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  def record_not_found
    render json: { error: 'Record not found' }, status: :not_found
  end
end