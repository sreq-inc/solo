#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod auth;
pub mod client;
pub mod error;
pub mod export;
pub mod graphql;
pub mod grpc;
pub mod http;
pub mod import;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            http::plain_request,
            http::basic_auth_request,
            http::bearer_auth_request,
            http::graphql_request,
            http::graphql_basic_auth_request,
            http::graphql_bearer_auth_request,
            http::graphql_introspection,
            http::graphql_introspection_with_auth,
            grpc::commands::grpc_unary_request,
            grpc::commands::grpc_server_streaming_request,
            grpc::commands::grpc_discover_services,
            grpc::commands::grpc_parse_proto_file,
            grpc::commands::grpc_get_service_info,
            grpc::commands::grpc_get_method_info,
            grpc::commands::grpc_test_connection,
            import::import_postman_collection,
            import::import_insomnia_workspace,
            export::export_collection,
            export::export_all_collections,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
