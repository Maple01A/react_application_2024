class ApplicationController < ActionController::Base
  # APIリクエスト用の例外処理
  protect_from_forgery with: :null_session
end
