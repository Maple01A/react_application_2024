# Be sure to restart your server when you modify this file.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 本番環境では実際のフロントエンドドメインに制限する
    origins ENV['CORS_ORIGIN'] || 'http://localhost:5173'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Access-Control-Allow-Origin'],
      max_age: 600
  end
end