const fs = require('fs');
const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const path = require('path');

async function readFileAsync(path) {
  return fs.promises.readFile(path, 'utf8');
}

async function saveFileAsync(path, content) {
  return fs.promises.writeFile(path, content, 'utf8');
}

const withPermissionConfig = (config, props) => {
  const permissions = props.permissions ?? [];
  const permissionsPath = permissions.map(item => `pod 'Permission-${item}', :path => "#{permissions_path}/${item}"`).join('\n  ');
  return withPlugins(config, [(c) => withPermissionSupport.bind(permissionsPath, c)])
}

const withPermissionSupport = (permissionsPath, c) =>
  withDangerousMod(c, [
    'ios',
    async config => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const contents = await readFileAsync(file);
      let newContents = contents;
      if (
        contents.indexOf(
          '# Convert all permission pods into static libraries'
        ) === -1
      ) {
        const regText = `use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']`;
        const index = contents.indexOf(
          regText
        );
        if (index > -1) {
          newContents =
            contents.slice(0, index + regText.length) +
            `
  # Convert all permission pods into static libraries
  pre_install do |installer|
    Pod::Installer::Xcode::TargetValidator.send(:define_method, :verify_no_static_framework_transitive_dependencies) {}

    installer.pod_targets.each do |pod|
      if pod.name.eql?('RNPermissions') || pod.name.start_with?('Permission-')
        def pod.build_type;
          # Uncomment the line corresponding to your CocoaPods version
          Pod::BuildType.static_library # >= 1.9
          # Pod::Target::BuildType.static_library # < 1.9
        end
      end
    end
  end

  permissions_path = '../node_modules/react-native-permissions/ios'

  ${permissionsPath}
  ` +
            contents.slice(index + regText.length);
        }
      }
      await saveFileAsync(file, newContents);
      return config;
    },
  ]);

module.exports = withPermissionConfig;