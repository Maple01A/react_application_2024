class Task < ApplicationRecord
  validates :title, presence: true
  
  enum status: {
    pending: 0,
    in_progress: 1,
    completed: 2
  }, _default: :pending
  
  scope :active, -> { where.not(status: :completed) }
  scope :completed, -> { where(status: :completed) }
end