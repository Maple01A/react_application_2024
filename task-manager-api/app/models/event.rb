# app/models/event.rb
class Event < ApplicationRecord
  validates :title, presence: true
  validates :date, presence: true
end