terraform {
  required_providers {
    # Docker helyett "random" és "local" providereket használunk
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
    local = {
      source = "hashicorp/local"
      version = "2.4.0"
    }
  }
}

provider "random" {}
provider "local" {}

# 1. Erőforrás: Generálunk egy véletlenszerű jelszót az adatbázisnak
# Ez szimulálja az infrastruktúra biztonsági beállítását
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 2. Erőforrás: Létrehozunk egy "szimulált" adatbázis konfigurációs fájlt
# Ez bizonyítja, hogy a Terraform képes fájlokat és beállításokat kezelni
resource "local_file" "db_config" {
  filename = "${path.module}/database_config.txt"
  content  = <<EOT
db_host=localhost
db_port=5432
db_name=boosted
db_user=boosted_user
db_password=${random_password.db_password.result}
EOT
}