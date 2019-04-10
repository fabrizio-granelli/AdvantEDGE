## meepctl config

Config allows to manage meepctl configuration

### Synopsis

Config allows to manage meepctl configuration

meepctl relies on a configuration file that lives here $(HOME)/.meepctl.yaml

On first meepctl execution, it will be automatically created with default values
It then needs to be initialized by running the command shown in the example.

- IP is the IPV4 address of the local node where AdvantEDGE and meepctl are used
- gitdir is the path to the GIT directory of AdvantEDGE


```
meepctl config [flags]
```

### Examples

```
  # Initial configuration
 meepctl config set --ip <your-node-ip> --gitdir <path-to-advantedge-git-dir>
 # Help on set command
 meepctl config set --help
```

### Options

```
  -h, --help   help for config
```

### Options inherited from parent commands

```
  -t, --time      Display timing information
  -v, --verbose   Display debug information
```

### SEE ALSO

* [meepctl](meepctl.md)	 - meepctl - CLI application to control the AdvantEDGE platform
* [meepctl config set](meepctl_config_set.md)	 - Set an individual value in the meepctl config file

###### Auto generated by spf13/cobra on 1-Apr-2019