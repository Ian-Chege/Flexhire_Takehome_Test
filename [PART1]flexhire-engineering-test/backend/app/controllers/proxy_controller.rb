class ProxyController < ApplicationController
  skip_before_action :verify_authenticity_token
  include HTTParty

  BASE_URL = "https://flexhire.com/api/v2"

  def proxy
    # Parse the incoming GraphQL request
    graphql_query = params[:query]
    graphql_variables = params[:variables]

    # Make a request to the Flexhire API
    response = HTTParty.post(
      BASE_URL,
      headers: {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{ENV['FLEXHIRE_API_KEY']}"
      },
      body: {
        query: graphql_query,
        variables: graphql_variables
      }.to_json
    )

    # Return the response from Flexhire to the frontend
    render json: response.body, status: response.code
  rescue HTTParty::Error
    render json: { error: "An error occurred while proxying the request." }, status: :bad_gateway
  end

  private

  def authenticate_api_key
    api_key = request.headers["X-API-KEY"] || params[:apiKey]

    unless api_key && FlexhireApiKeyValidator.valid?(api_key)
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
