%define platform openmooc
%define name askbot-%{platform}
%define version 0.0dev
%define unmangled_version 0.0dev
%define release 1

Summary: Askbot openmooc integration like theme and saml2
Name: %{name}
Version: %{version}
Release: %{release}
Source0: %{name}-%{unmangled_version}.tar.gz
License: Apache Software License
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
BuildArch: noarch
Vendor: Rooter <info@rooter.es>
Url: https://github.com/OpenMOOC/askbot-openmooc
Requires: askbot=0.7.44, python-memcached, djangosaml2=0.9.0

%description
Askbot customizations for OpenMOOC
==================================

 * OpenMOOC theme
 * Specific Settings
 * SAML2 integration
 * Required API views to integrate with moocng


%prep
%setup -n %{name}-%{unmangled_version} -n %{name}-%{unmangled_version}

%build
python setup.py build

%install
#python setup.py install --single-version-externally-managed -O1 --root=$RPM_BUILD_ROOT --record=INSTALLED_FILES
python setup.py install --root=$RPM_BUILD_ROOT


# Create directories
 
# /usr/share/doc
install -d -m 755 %{buildroot}/%{_defaultdocdir}/
 
# /etc/openmooc
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}
 
# /etc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{name}
 
# /etc/openmooc/askbot/instances
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{name}/%{instances}

# /usr/libexexec/openmooc
install -d -m 755 %{buildroot}/%{_libexecdir}/%{platform}

# /usr/share/askbot-openmooc
install -d -m 755 %{buildroot}/%{_datadir}/%{name}

# /var/lib/askbot-openmooc
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{name}

# /var/lib/askbot-openmooc/instances
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{name}/instances



%clean
rm -rf $RPM_BUILD_ROOT

#%files -f INSTALLED_FILES
%files
%defattr(-,root,root)

%dir %{_defaultdocdir}/
%dir %{_sysconfdir}/%{platform}
%dir %{_sysconfdir}/%{platform}/%{name}
%dir %{_sysconfdir}/%{platform}/%{name}/%{instances}
%dir %{_libexecdir}/%{platform}
%dir %{_datadir}/%{name}
%dir %{_sharedstatedir}/%{name}
%dir %{_sharedstatedir}/%{name}/instances
