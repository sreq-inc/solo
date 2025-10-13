use serde::{Deserialize, Serialize};
use std::fmt;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AppError {
    HttpError {
        message: String,
        status_code: Option<u16>,
    },
    ParseError {
        message: String,
    },
    AuthError {
        message: String,
    },
    ValidationError {
        field: String,
        message: String,
    },
    NetworkError {
        message: String,
    },
    InternalError {
        message: String,
    },
}

impl AppError {
    pub fn http(message: impl Into<String>, status_code: Option<u16>) -> Self {
        Self::HttpError {
            message: message.into(),
            status_code,
        }
    }

    pub fn parse(message: impl Into<String>) -> Self {
        Self::ParseError {
            message: message.into(),
        }
    }

    pub fn auth(message: impl Into<String>) -> Self {
        Self::AuthError {
            message: message.into(),
        }
    }

    pub fn validation(field: impl Into<String>, message: impl Into<String>) -> Self {
        Self::ValidationError {
            field: field.into(),
            message: message.into(),
        }
    }

    pub fn network(message: impl Into<String>) -> Self {
        Self::NetworkError {
            message: message.into(),
        }
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::InternalError {
            message: message.into(),
        }
    }

    pub fn message(&self) -> &str {
        match self {
            AppError::HttpError { message, .. } => message,
            AppError::ParseError { message } => message,
            AppError::AuthError { message } => message,
            AppError::ValidationError { message, .. } => message,
            AppError::NetworkError { message } => message,
            AppError::InternalError { message } => message,
        }
    }

    pub fn error_type(&self) -> &'static str {
        match self {
            AppError::HttpError { .. } => "HttpError",
            AppError::ParseError { .. } => "ParseError",
            AppError::AuthError { .. } => "AuthError",
            AppError::ValidationError { .. } => "ValidationError",
            AppError::NetworkError { .. } => "NetworkError",
            AppError::InternalError { .. } => "InternalError",
        }
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::HttpError {
                message,
                status_code,
            } => match status_code {
                Some(code) => write!(f, "HTTP Error ({}): {}", code, message),
                None => write!(f, "HTTP Error: {}", message),
            },
            AppError::ParseError { message } => write!(f, "Parse Error: {}", message),
            AppError::AuthError { message } => write!(f, "Authentication Error: {}", message),
            AppError::ValidationError { field, message } => {
                write!(f, "Validation Error on '{}': {}", field, message)
            }
            AppError::NetworkError { message } => write!(f, "Network Error: {}", message),
            AppError::InternalError { message } => write!(f, "Internal Error: {}", message),
        }
    }
}

impl std::error::Error for AppError {}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            AppError::network("Request timeout")
        } else if err.is_connect() {
            AppError::network("Connection failed")
        } else if let Some(status) = err.status() {
            AppError::http(
                format!("HTTP request failed: {}", err),
                Some(status.as_u16()),
            )
        } else {
            AppError::network(format!("Request failed: {}", err))
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::parse(format!("JSON parsing failed: {}", err))
    }
}

impl From<tonic::codegen::http::uri::InvalidUri> for AppError {
    fn from(err: tonic::codegen::http::uri::InvalidUri) -> Self {
        AppError::validation("url", format!("Invalid gRPC URL: {}", err))
    }
}

impl From<tonic::transport::Error> for AppError {
    fn from(err: tonic::transport::Error) -> Self {
        AppError::network(format!("gRPC transport error: {}", err))
    }
}

impl From<String> for AppError {
    fn from(err: String) -> Self {
        AppError::internal(err)
    }
}

impl From<&str> for AppError {
    fn from(err: &str) -> Self {
        AppError::internal(err.to_string())
    }
}

impl From<prost_reflect::DescriptorError> for AppError {
    fn from(err: prost_reflect::DescriptorError) -> Self {
        AppError::parse(format!("Descriptor error: {}", err))
    }
}

impl From<prost::DecodeError> for AppError {
    fn from(err: prost::DecodeError) -> Self {
        AppError::parse(format!("Protobuf decode error: {}", err))
    }
}

impl From<tonic::Status> for AppError {
    fn from(err: tonic::Status) -> Self {
        AppError::network(format!("gRPC error: {}", err.message()))
    }
}

impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let http_err = AppError::http("Not found", Some(404));
        assert_eq!(http_err.message(), "Not found");
        assert_eq!(http_err.error_type(), "HttpError");

        let parse_err = AppError::parse("Invalid JSON");
        assert_eq!(parse_err.message(), "Invalid JSON");
        assert_eq!(parse_err.error_type(), "ParseError");
    }

    #[test]
    fn test_error_display() {
        let err = AppError::validation("email", "Invalid email format");
        let display = format!("{}", err);
        assert!(display.contains("Validation Error"));
        assert!(display.contains("email"));
        assert!(display.contains("Invalid email format"));
    }

    #[test]
    fn test_error_from_string() {
        let err = AppError::internal("Something went wrong");
        let string_err: String = err.into();
        assert!(string_err.contains("Internal Error"));
    }
}
