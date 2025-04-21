class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.string :title
      t.datetime :date
      t.text :description

      t.timestamps
    end
  end
end
