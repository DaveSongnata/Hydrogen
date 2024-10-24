from PIL import Image
import os

def create_android_icons(logo_path, output_dir):
    # Tamanhos padrão para ícones Android (em pixels)
    sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    # Abrir a imagem original
    try:
        original = Image.open(logo_path)
        
        # Criar diretórios se não existirem
        for folder in sizes.keys():
            folder_path = os.path.join(output_dir, folder)
            os.makedirs(folder_path, exist_ok=True)
            
            # Redimensionar e salvar
            size = sizes[folder]
            resized = original.resize((size, size), Image.Resampling.LANCZOS)
            
            # Salvar como ic_launcher.png e ic_launcher_round.png
            output_path = os.path.join(folder_path, 'ic_launcher.png')
            output_path_round = os.path.join(folder_path, 'ic_launcher_round.png')
            resized.save(output_path, 'PNG')
            resized.save(output_path_round, 'PNG')
            
            print(f'Criado ícone {size}x{size} em {folder}')
            
    except Exception as e:
        print(f'Erro ao processar a imagem: {e}')

# Caminhos ajustados para a estrutura típica do React Native
logo_path = './src/assets/icons/logo.png'  # Ajuste se necessário
output_dir = './android/app/src/main/res'  # Diretório padrão do Android no React Native

create_android_icons(logo_path, output_dir)
